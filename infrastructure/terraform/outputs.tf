output "alb_dns_name" {
  description = "ALB DNS name — point your Cloudflare A record here"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (private)"
  value       = aws_db_instance.postgres.address
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint (private)"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  sensitive   = true
}

output "s3_documents_bucket" {
  description = "S3 bucket name for document storage"
  value       = aws_s3_bucket.documents.bucket
}

output "ecr_api_url" {
  description = "ECR URL for api-server image"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_portal_url" {
  description = "ECR URL for staff-portal image"
  value       = aws_ecr_repository.portal.repository_url
}

output "ecr_website_url" {
  description = "ECR URL for mtc-website image"
  value       = aws_ecr_repository.website.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}
