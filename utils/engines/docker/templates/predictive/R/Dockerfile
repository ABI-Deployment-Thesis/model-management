# Use the specific version of R base image
FROM r-base:4.1.3

RUN R -e "install.packages('jsonlite', repos='http://cran.rstudio.com/')"
RUN R -e "install.packages('remotes', repos='http://cran.rstudio.com/')"
#<DEPENDENCIES>

# Create a directory for your R script and model file
RUN mkdir /app
WORKDIR /app

# Copy your R script and model file into the Docker image
COPY . .

# Command to run your R script with CMD
ENTRYPOINT ["Rscript", "app.R"]