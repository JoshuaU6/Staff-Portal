variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (prod, staging)"
  type        = string
  default     = "prod"
}

variable "project" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "mtc"
}

variable "domain_name" {
  description = "Primary domain (e.g. mtc-groups.com)"
  type        = string
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "mtcdb"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "mtc_user"
}

variable "db_password" {
  description = "PostgreSQL master password — store in Terraform Cloud or AWS Secrets Manager, never in source"
  type        = string
  sensitive   = true
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "ecr_registry" {
  description = "ECR registry URL (account.dkr.ecr.region.amazonaws.com)"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to deploy (git SHA)"
  type        = string
  default     = "latest"
}

variable "clerk_secret_key" {
  description = "Clerk production secret key"
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "64-char hex session signing secret"
  type        = string
  sensitive   = true
}

variable "clerk_publishable_key" {
  description = "Clerk production publishable key (pk_live_*) — also baked into Docker portal image at build time"
  type        = string
  sensitive   = true
}
