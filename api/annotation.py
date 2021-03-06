from flask import jsonify
from flask_restful import request, Resource
from .experiment.experiment_cache import ExperimentCache

import json
import numpy as np


class Annotation(Resource):

    def put(self, experiment_name, sample_idx):
        req_json = json.loads(request.data.decode('utf-8'))
        mask = req_json['mask']
        try:
            np.array(mask, dtype='uint8')
        except Exception:
            return 'Mask in invalid format.', 400

        try:
            experiment = ExperimentCache().get_experiment(experiment_name)
            experiment.set_annotation(sample_idx, mask)
        except KeyError as ke:
            return str(ke), 400
        except Exception as ex:
            return str(ex), 500
        return 'Annotation added.', 200

    def get(self, experiment_name, sample_idx):
        try:
            experiment = ExperimentCache().get_experiment(experiment_name)
            result = experiment.get_annotation(sample_idx)
            return jsonify(result)
        except KeyError as ke:
            return str(ke), 400
        except Exception as ex:
            return str(ex), 500

    def delete(self, experiment_name, sample_idx):
        try:
            experiment = ExperimentCache().get_experiment(experiment_name)
            experiment.delete_annotation(sample_idx)
            return 'Annotation deleted', 200
        except KeyError as ke:
            return str(ke), 400
        except Exception as ex:
            return str(ex), 500
