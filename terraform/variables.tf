variable "aws_region" {
  description = "Región de AWS utilizada para el laboratorio"
  type        = string
  default     = "us-east-2"
}

variable "vpc_id" {
  description = "VPC donde se desplegó el prototipo"
  type        = string
}

variable "public_subnet_ids" {
  description = "Subredes públicas utilizadas por ECS Fargate y ALB"
  type        = list(string)
}

variable "alb_sg_id" {
  description = "Security Group asociado al Application Load Balancer"
  type        = string
}

variable "ecs_sg_id" {
  description = "Security Group asociado a las tareas ECS Fargate"
  type        = string
}
