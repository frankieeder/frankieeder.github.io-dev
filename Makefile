.PHONY: serve serve-node install

PORT = 8005

run:
	python3 -m http.server $(PORT)
