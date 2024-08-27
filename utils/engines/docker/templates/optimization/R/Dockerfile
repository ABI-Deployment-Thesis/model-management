FROM r-base:#<DOCKER_TAG>

RUN R -e "install.packages('jsonlite', repos='http://cran.rstudio.com/')"
RUN R -e "install.packages('remotes', repos='http://cran.rstudio.com/')"
#<DEPENDENCIES>

# Create a directory for your R script and model file
RUN mkdir /app
WORKDIR /app

# Copy your R script and model file into the Docker image
COPY . .

# Command to run your R script with CMD
ENTRYPOINT ["Rscript", "main.R"]