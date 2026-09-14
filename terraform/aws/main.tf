module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${var.project_name}-${var.env}-vpc"
  cidr = var.vpc_cidr

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Environment = var.env
    Project     = var.project_name
  }
}

resource "aws_ecr_repository" "app" {
  name                 = "${var.project_name}-${var.env}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "${var.project_name}-${var.env}-db"
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t4g.micro"
  db_name                = "appdb"
  username               = var.db_username
  password               = var.db_password
  skip_final_snapshot    = true
  publicly_accessible    = false
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [aws_security_group.rds.id]
  backup_retention_period = 7
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.env}-rds-sg"
  description = "Allow PostgreSQL from the VPC"
  vpc_id      = module.vpc.vpc_id

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
}

resource "aws_eks_cluster" "main" {
  name     = "${var.project_name}-${var.env}-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.30"

  vpc_config {
    subnet_ids = module.vpc.public_subnets
  }
}

resource "aws_iam_role" "eks_cluster" {
  name = "${var.project_name}-${var.env}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}
