# Base image
FROM python:#<DOCKER_TAG>

# Set the working directory
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt .

# Install the required packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the source code to the container
COPY . .

# Run CLI
ENTRYPOINT ["python", "app.py"]