output "ecr_backend_repository" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.macs.name
}

output "ecs_service_name" {
  value = aws_ecs_service.macs.name
}

output "alb_dns_name" {
  value = aws_lb.macs.dns_name
}

output "target_group_name" {
  value = aws_lb_target_group.macs.name
}
