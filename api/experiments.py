from flask import jsonify
from flask_restful import request, Resource

from .experiment.experiment_cache import ExperimentCache


class Experiments(Resource):

    def get(self):
        experiment_cache = ExperimentCache().get_experiment_cache()
        experiments = []
        for exp in experiment_cache.values():
            experiments.append({
                'name': exp.pretty_name(),
                'id': exp.__class__.__name__,
                'description': exp.description(),
                'domain': exp.domain().value,
                'initialized': exp.status.initialized
            })
            experiments.append({
                'name': exp.pretty_name(),
                'id': 'efe' + exp.__class__.__name__,
                'description': exp.description(),
                'domain': exp.domain().value,
                'started': exp.status.started
            })
        return jsonify({'all_experiments': experiments})
