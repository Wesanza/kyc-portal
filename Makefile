.PHONY: dev migrate makemigrations createsuperuser shell test lint worker

# Start the full dev stack
dev:
	docker compose up

# Run database migrations
migrate:
	cd kyc_backend && python manage.py migrate

# Create new migrations
makemigrations:
	cd kyc_backend && python manage.py makemigrations

# Create a superuser
createsuperuser:
	cd kyc_backend && python manage.py createsuperuser

# Open Django shell
shell:
	cd kyc_backend && python manage.py shell

# Run tests
test:
	cd kyc_backend && pytest --cov=. --cov-report=term-missing -v

# Lint
lint:
	cd kyc_backend && flake8 . --max-line-length=120 --exclude=migrations,__pycache__

# Start Celery worker locally (without Docker)
worker:
	cd kyc_backend && celery -A celery_worker worker -l info

# Install dev dependencies
install-dev:
	pip install -r kyc_backend/requirements/dev.txt

# Generate OpenAPI schema
schema:
	cd kyc_backend && python manage.py spectacular --file schema.yml
