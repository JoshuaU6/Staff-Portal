# MTC Group — Production Deployment Runbook

This guide covers the full end-to-end process to deploy MTC Group's platform from scratch on AWS. Follow it sequentially on first deploy; for subsequent deploys the CI/CD pipeline handles steps 4–7 automatically.

---

## Architecture Overview

```
Internet → Cloudflare (WAF, CDN) → CloudFront → ALB
                                                  ├── /api/*     → ECS: api-server  → RDS PostgreSQL
                                                  ├── /portal/*  → ECS: staff-portal (nginx static)
                                                  └── /          → ECS: mtc-website  (nginx static)
```

All ECS tasks run in **private subnets** (no public IP). The ALB and NAT gateway are in public subnets.

---

## Prerequisites

| Requirement                | Notes                                                              |
|----------------------------|--------------------------------------------------------------------|
| AWS account                | With admin access to create VPC, ECS, RDS, ECR, IAM, CloudFront   |
| Terraform ≥ 1.6            | `brew install terraform` or tfenv                                  |
| AWS CLI v2                 | Configured with `aws configure`                                    |
| Docker (with buildx)       | For building and pushing images                                    |
| Domain `mtc-groups.com`    | Registered and ready for NS changes                                |
| Clerk production instance  | Separate from the development Clerk instance                       |
| GitHub repository          | With Actions enabled and secrets configured                        |

---

## Step 1 — Bootstrap Terraform State (one-time)

Create the S3 bucket and DynamoDB table for remote state **before** running `terraform init`:

```bash
aws s3api create-bucket \
  --bucket mtc-terraform-state \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket mtc-terraform-state \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket mtc-terraform-state \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws dynamodb create-table \
  --table-name mtc-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

---

## Step 2 — ACM Certificate (Terraform-managed)

The ACM certificate is provisioned automatically by Terraform in Step 4. After `terraform apply`:

```bash
# Show the DNS validation CNAME records
terraform output acm_validation_records
```

Add those CNAME records to your DNS provider (Cloudflare or Route53). Once DNS propagates, ACM validates automatically and `terraform apply` completes. No manual `aws acm request-certificate` needed.

---

## Step 3 — Configure Terraform Variables

Create `infrastructure/terraform/terraform.tfvars` (never commit this file):

```hcl
aws_region            = "us-east-1"
environment           = "prod"
project               = "mtc"
domain_name           = "mtc-groups.com"
db_password           = "STRONG_RANDOM_PASSWORD_HERE"
clerk_secret_key      = "sk_live_YOUR_CLERK_SECRET_KEY"
clerk_publishable_key = "pk_live_YOUR_CLERK_PUBLISHABLE_KEY"
session_secret        = "64_HEX_CHAR_RANDOM_SECRET"
ecr_registry          = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"
image_tag             = "latest"
```

> **ACM Certificate**: Terraform now provisions the ACM certificate automatically (`aws_acm_certificate`). After `terraform apply`, check the `acm_validation_records` output and add those CNAME records to your DNS provider (Cloudflare). Validation takes 1–5 minutes. `aws_acm_certificate_validation` will wait up to 30 minutes before timing out.

Add `terraform.tfvars` to `.gitignore`.

---

## Step 4 — Run Terraform

```bash
cd infrastructure/terraform

terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Note the outputs — you'll need `alb_dns_name`, `ecr_api_url`, `ecr_portal_url`, `ecr_website_url`.

---

## Step 5 — Run Database Migrations

After RDS is up, run Drizzle push from a bastion host or GitHub Actions job with VPC access:

```bash
# From a machine with network access to RDS (or via AWS SSM Session Manager):
DATABASE_URL="postgresql://mtc_user:PASSWORD@RDS_ENDPOINT:5432/mtcdb?sslmode=require" \
  npm run push -w @workspace/db
```

---

## Step 6 — Configure GitHub Actions Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

| Secret                  | Value                                                    |
|-------------------------|----------------------------------------------------------|
| `AWS_DEPLOY_ROLE_ARN`   | IAM role ARN for OIDC-based GitHub Actions deploy        |
| (All env vars are baked into ECS task definitions via Terraform — not GitHub secrets) |

To create the OIDC role for GitHub Actions:
```bash
# See: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html
# Trust policy should allow: token.actions.githubusercontent.com
# for repo: YourOrg/mtc-groups, ref: refs/heads/main
```

---

## Step 7 — First Deploy

```bash
# Build and push images manually for the first deploy
IMAGE_TAG=$(git rev-parse --short HEAD)
ECR_REGISTRY="ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin "$ECR_REGISTRY"

docker buildx build -f docker/api-server/Dockerfile \
  -t "$ECR_REGISTRY/mtc-prod-api-server:$IMAGE_TAG" \
  -t "$ECR_REGISTRY/mtc-prod-api-server:latest" . --push

docker buildx build -f docker/staff-portal/Dockerfile \
  -t "$ECR_REGISTRY/mtc-prod-staff-portal:$IMAGE_TAG" \
  -t "$ECR_REGISTRY/mtc-prod-staff-portal:latest" . --push

docker buildx build -f docker/mtc-website/Dockerfile \
  -t "$ECR_REGISTRY/mtc-prod-website:$IMAGE_TAG" \
  -t "$ECR_REGISTRY/mtc-prod-website:latest" . --push

# Update ECS services
for svc in api portal website; do
  aws ecs update-service \
    --cluster mtc-prod-cluster \
    --service "mtc-prod-${svc}" \
    --force-new-deployment \
    --region us-east-1
done
```

---

## Step 8 — Configure Cloudflare

Follow `infrastructure/cloudflare/README.md` to:
1. Add domain to Cloudflare
2. Point DNS to CloudFront distribution
3. Enable WAF rules and DDoS protection
4. Set SSL mode to Full (strict)

---

## Step 9 — Configure Backup Cron

On any EC2 instance or ECS scheduled task:

```bash
chmod +x infrastructure/backup/backup.sh

# Add to crontab (runs at 03:00 UTC daily)
echo "0 3 * * * DB_HOST=RDS_ENDPOINT DB_USER=mtc_user PGPASSWORD=PASSWORD \
  S3_BUCKET=mtc-prod-documents AWS_REGION=us-east-1 \
  /opt/mtc/backup.sh >> /var/log/mtc-backup.log 2>&1" | crontab -
```

---

## Environment Variable Checklist

All variables that the API container requires at runtime:

| Variable                  | Required | Source                          |
|---------------------------|----------|---------------------------------|
| `NODE_ENV`                | Yes      | `production` (hardcoded)        |
| `PORT`                    | Yes      | `8080` (hardcoded)              |
| `DATABASE_URL`            | Yes      | Terraform → RDS endpoint        |
| `CLERK_PUBLISHABLE_KEY`   | Yes      | Clerk dashboard (production) — also Docker build arg for staff-portal |
| `CLERK_SECRET_KEY`        | Yes      | Clerk dashboard (production)    |
| `SESSION_SECRET`          | Yes      | `openssl rand -hex 64`          |
| `REDIS_URL`               | No       | Terraform → ElastiCache         |
| `S3_DOCUMENTS_BUCKET`     | No       | Terraform → S3 bucket name      |

---

## Rollback Procedure

### Fast rollback (ECS — < 2 minutes)

```bash
# Find the previous task definition revision
aws ecs list-task-definitions \
  --family-prefix mtc-prod-api-server \
  --sort DESC --query 'taskDefinitionArns[0:3]'

# Update service to previous revision
aws ecs update-service \
  --cluster mtc-prod-cluster \
  --service mtc-prod-api \
  --task-definition mtc-prod-api-server:PREVIOUS_REVISION \
  --region us-east-1

aws ecs wait services-stable \
  --cluster mtc-prod-cluster \
  --services mtc-prod-api
```

### Image rollback

```bash
# Re-tag a known-good SHA as latest and force new deployment
GOOD_SHA=abc1234
ECR_REGISTRY="ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

# Pull, re-tag, push
docker pull "$ECR_REGISTRY/mtc-prod-api-server:$GOOD_SHA"
docker tag  "$ECR_REGISTRY/mtc-prod-api-server:$GOOD_SHA" \
            "$ECR_REGISTRY/mtc-prod-api-server:latest"
docker push "$ECR_REGISTRY/mtc-prod-api-server:latest"

aws ecs update-service \
  --cluster mtc-prod-cluster \
  --service mtc-prod-api \
  --force-new-deployment
```

---

## Monitoring

| Alarm                        | Threshold          | Action                                    |
|------------------------------|--------------------|-------------------------------------------|
| API 5xx rate                 | > 1% over 5 min    | Page on-call, check ECS logs              |
| RDS connections              | > 80               | Scale ECS tasks down or tune pool size    |
| ECS API CPU                  | > 80% over 15 min  | Increase `desired_count` on ECS service   |
| ElastiCache evictions        | > 0                | Increase node size                        |

**CloudWatch Log Insights query — recent 5xx errors:**

```
fields @timestamp, @message
| filter @message like /5\d\d/
| sort @timestamp desc
| limit 50
```

**View ECS logs in real time:**

```bash
aws logs tail /ecs/mtc-prod/api-server --follow --region us-east-1
```

---

## Staging Environment

The same Terraform and Docker setup applies for staging. Set `environment = "staging"` in `terraform.tfvars` and push to the `staging` branch to trigger the staging deploy workflow. Staging uses smaller instance sizes (`db.t3.micro`, 1 ECS task per service) and a separate Clerk instance.
