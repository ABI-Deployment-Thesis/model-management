ifneq (,$(wildcard .env.development))
    include .env.development
    export
endif

# Variables
IMAGE_NAME ?= abi-deployment-thesis/model-management
TAG ?= dev

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME):$(TAG) .