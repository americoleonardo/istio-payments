# Istio payments

Sample application with 3 microservices showcasing Kubernetes, Istio, microservice applications.

This application will work when you have a Kubernetes with Istio provided.


# Installation

```
$ kubectl apply -f kubernetes/
$ kubectl apply -f brands/kubernetes/
$ kubectl apply -f payments/kubernetes/
$ kubectl apply -f payment-adapter-mastercard/kubernetes/
```
