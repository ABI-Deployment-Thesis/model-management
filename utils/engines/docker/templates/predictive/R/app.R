# Load required libraries
library(jsonlite)
#<DEPENDENCIES>

# Function to parse JSON input features and create a data frame
parse_input_features <- function(input_features_str) {
  tryCatch({
    parsed <- fromJSON(input_features_str)
    
    if (!is.data.frame(parsed) || !all(c("name", "value") %in% colnames(parsed))) {
      stop("Parsed JSON should be a data frame with 'name' and 'value' columns")
    }
    
    feature_values <- parsed$value
    feature_names <- as.character(parsed$name)
    features_df <- as.data.frame(t(feature_values), stringsAsFactors = FALSE)
    colnames(features_df) <- feature_names
    
    return(features_df)
  }, error = function(e) {
    message <- paste("Error parsing input features JSON:", e$message)
    stop(message)
  })
}

# Function to match input data types to the model
match_data_types <- function(input_data, model) {
  model_terms <- attr(model$terms, "dataClasses")
  for (term in names(model_terms)) {
    if (term %in% colnames(input_data)) {
      expected_type <- model_terms[[term]]
      if (expected_type == "numeric" && !is.numeric(input_data[[term]])) {
        input_data[[term]] <- as.numeric(input_data[[term]])
      } else if (expected_type == "factor" && !is.factor(input_data[[term]])) {
        input_data[[term]] <- as.factor(input_data[[term]])
      } else if (expected_type == "integer" && !is.integer(input_data[[term]])) {
        input_data[[term]] <- as.integer(input_data[[term]])
      }
    }
  }
  return(input_data)
}

# Main function to predict using the model
predict_internment_status <- function(model_file, input_features_str) {
  # Load the model
  tryCatch({
    model <- readRDS(model_file)
  }, error = function(e) {
    message <- paste("Error loading the model file:", e$message)
    stop(message)
  })
  
  # Parse the input features and create the data frame
  input_data <- parse_input_features(input_features_str)
  
  # Match input data types to the model
  input_data <- match_data_types(input_data, model)
  
  prediction <- predict(model, input_data)

  # Make the prediction
  tryCatch({
    response <- list(success = TRUE, prediction = prediction)
  }, error = function(e) {
    message <- paste("Error during prediction:", e$message)
    response <- list(success = FALSE, error = message)
  })
  
  return(response)
}

# Command-line argument parsing
args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 2) {
  stop("Insufficient arguments. Usage: Rscript script.R --model_file <model_file> --input_features <input_features>")
}

# Extract arguments
model_file <- NULL
input_features_str <- NULL

for (i in 1:(length(args)-1)) {
  if (args[i] == "--model_file") {
    model_file <- args[i + 1]
  } else if (args[i] == "--input_features") {
    input_features_str <- args[i + 1]
  }
}

# Check if arguments are provided
if (is.null(model_file) || is.null(input_features_str)) {
  stop("Required arguments --model_file and --input_features are missing.")
}

# Perform prediction
result <- predict_internment_status(model_file, input_features_str)

# Print result as JSON
cat(toJSON(result, auto_unbox = TRUE), "\n")
