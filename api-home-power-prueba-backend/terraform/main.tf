# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "VPC ID where resources will be created"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block of the VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# RDS Database
resource "aws_db_instance" "homepower_db" {
  identifier = "homepower-postgres"
  
  engine         = "postgres"
  engine_version = "14.7"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type         = "gp2"
  storage_encrypted    = true
  
  db_name  = "homepower"
  username = "postgres"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.homepower.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = true
  deletion_protection = false
  
  tags = {
    Name        = "homepower-postgres"
    Environment = "production"
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name_prefix = "homepower-rds-"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "homepower-rds-sg"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "homepower" {
  name       = "homepower-subnet-group"
  subnet_ids = var.private_subnet_ids
  
  tags = {
    Name = "homepower-subnet-group"
  }
}

# Secrets Manager for database credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "homepower/db-credentials"
  description             = "Database credentials for HomePower API"
  recovery_window_in_days = 7
  
  tags = {
    Name        = "homepower-db-credentials"
    Environment = "production"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "postgres"
    password = var.db_password
    host     = aws_db_instance.homepower_db.endpoint
    port     = "5432"
    database = "homepower"
  })
}

# Outputs
output "db_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.homepower_db.endpoint
}

output "db_port" {
  description = "RDS instance port"
  value       = aws_db_instance.homepower_db.port
}

output "secrets_manager_arn" {
  description = "Secrets Manager ARN for database credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

