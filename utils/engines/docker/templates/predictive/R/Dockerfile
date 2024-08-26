FROM rocker/r2u:#<DOCKER_TAG>
RUN install.r Seurat

RUN R -e "install.packages('jsonlite')"
RUN R -e "install.packages('remotes')"
#<DEPENDENCIES>

# Create a directory for your R script and model file
RUN mkdir /app
WORKDIR /app

# Copy your R script and model file into the Docker image
COPY . .

# Command to run your R script with CMD
ENTRYPOINT ["Rscript", "app.R"]