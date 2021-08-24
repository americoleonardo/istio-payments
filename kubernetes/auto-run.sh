#/bin/sh

# Just for docker registry
kubectl apply -f docker-config.yaml

# Creating namespace
kubectl apply -f namespace.yaml

# config brands-ms
#kubectl apply -f ../brands/kubernetes/service.yaml
#kubectl apply -f ../brands/kubernetes/gateway.yaml
#kubectl apply -f ../brands/kubernetes/virtual-service.yaml
#kubectl apply -f ../brands/kubernetes/deployment.yaml