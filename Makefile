PYTHON ?= python3

.PHONY: lint test

lint:
	$(PYTHON) tools/lint_ic10.py

test:
	$(PYTHON) -m unittest discover -s tests

