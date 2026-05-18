.PHONY: serve serve-node install run open install-test-deps test

PORT = 8005

run:
	python3 -m http.server $(PORT)

open:
	open http://localhost:$(PORT)

# Install Playwright + pytest and the headless Chromium binary they need.
# Run once after cloning (or after bumping requirements-dev.txt).
#
# --with-deps tells Playwright to also install the system libraries it
# needs (libnss3, libatk*, etc.).  On Linux this shells out to apt-get
# and may prompt for sudo.  On macOS / Windows it's a no-op — Playwright
# only does the apt path on Debian-family Linux.
#
# This target is the single source of truth for test setup: the CI
# workflow at .github/workflows/lightbox-tests.yml invokes it directly.
install-test-deps:
	pip install -r requirements-dev.txt
	python -m playwright install --with-deps chromium

# Run the end-to-end lightbox tests.  Spins up its own http.server, so no
# need to `make run` first.  Also the single source of truth invoked by
# the CI workflow.
test:
	pytest tests/
