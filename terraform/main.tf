resource "aws_ecr_repository" "backend" {
  name = "macs-demo-backend"

  image_scanning_configuration {
    scan_on_push = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name = "macs-demo-frontend"

  image_scanning_configuration {
    scan_on_push = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecs_cluster" "macs" {
  name = "macs-demo-cluster"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lb" "macs" {
  name               = "macs-demo-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_sg_id]
  subnets            = var.public_subnet_ids
  ip_address_type    = "ipv4"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lb_target_group" "macs" {
  name        = "macs-demo-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/health"
    protocol            = "HTTP"
    port                = "traffic-port"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 2
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.macs.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.macs.arn
  }

  lifecycle {
    prevent_destroy = true
  }
}

data "aws_ecs_task_definition" "macs" {
  task_definition = "macs-demo-task"
}

resource "aws_ecs_service" "macs" {
  name            = "macs-demo-service"
  cluster         = aws_ecs_cluster.macs.arn
  task_definition = data.aws_ecs_task_definition.macs.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  health_check_grace_period_seconds = 60

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.macs.arn
    container_name   = "macs-frontend"
    container_port   = 80
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      task_definition,
      desired_count
    ]
  }
}
