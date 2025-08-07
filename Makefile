.PHONY: serve serve-node install

PORT = 8005

serve:
	python3 -m http.server $(PORT)

serve-node:
	npx http-server -p $(PORT)

install:
	@echo "No dependencies to install for this static site"
	@echo "Run 'make serve' to start local development server"
	@echo "Then visit http://localhost:8000" 