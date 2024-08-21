import argparse
import json
import sys

import pickle


def main():
    parser = argparse.ArgumentParser(
        description="Predict internment status using a pre-trained model."
    )
    parser.add_argument(
        "--model_file",
        type=str,
        required=True,
        help="Path to the model file (e.g., Model_GB_INT.sav)",
    )
    parser.add_argument(
        "--input_features",
        type=str,
        required=True,
        help='JSON string of input features (e.g., [{"name": "idade","value": 69},{"name": "cod_prioridade","value": 2.0}])',
    )

    args = parser.parse_args()

    # Load the model
    try:
        with open(args.model_file, 'rb') as file:
            model = pickle.load(file)
    except Exception as e:
        print({"success": False, "error": f"Error loading the model file: {e}"})
        sys.exit(1)

    # Parse the input features
    try:
        input_features_json = json.loads(args.input_features)
    except json.JSONDecodeError as e:
        print({"success": False, "error": f"Error parsing input features JSON: {e}"})
        sys.exit(1)

    # Extract the feature values
    feature_values = [feature["value"] for feature in input_features_json]

    # Prepare the input for the model
    input_data = [feature_values]

    # Make the prediction
    try:
        prediction = model.predict(input_data)
    except Exception as e:
        print({"success": False, "error": f"Error during prediction: {e}"})
        sys.exit(1)

    response = {"success": True, "prediction": prediction[0]}

    print(response)


if __name__ == "__main__":
    main()
