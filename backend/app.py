import requests

data = {'fileLocation': '/path/to/your/directory'}
response = requests.post('http://localhost:5000/send-data', json=data)
print(response.status_code, response.json())


if __name__ == '__main__':
    app.run(debug=True)