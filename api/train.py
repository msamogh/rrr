from flask import jsonify
from flask_restful import request, Resource
from .experiment.experiment_cache import ExperimentCache

import json


class Train(Resource):

    def post(self, experiment_name):
        req_json = json.loads(request.data.decode('utf-8'))
        try:
            num_epochs = int(req_json['num_epochs'])
            experiment = ExperimentCache().get_experiment(experiment_name)
            experiment.train(num_epochs=num_epochs)
            return jsonify({'success': True}), 200
        except ValueError:
            return 'num_epochs should be an integer.', 400
        except KeyError as ke:
            return str(ke), 400
        except Exception as ex:
            return str(ex), 500
