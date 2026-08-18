PYTHON ?= python3
BUN ?= bun
SCRIPT ?= scripts

.PHONY: setup lint test simulate test-sim validate

setup:
	$(BUN) install --frozen-lockfile

lint:
	$(PYTHON) tools/lint_ic10.py

test:
	$(PYTHON) -m unittest discover -s tests

simulate:
	$(BUN) run tools/sim_ic10.ts validate $(SCRIPT)

test-sim:
	$(BUN) test tests/simulator

validate:
	$(BUN) install --frozen-lockfile
	$(PYTHON) tools/lint_ic10.py
	$(PYTHON) -m unittest discover -s tests
	$(BUN) run tools/sim_ic10.ts validate scripts
	$(BUN) test tests/simulator
