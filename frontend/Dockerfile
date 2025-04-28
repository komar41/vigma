FROM node
COPY . /app/frontend
WORKDIR /app/frontend
RUN rm -rf node_modules dist build && npm install --legacy-peer-deps && npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
