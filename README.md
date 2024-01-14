## DOCKER
- ![Ayush URL](https://app.eraser.io/workspace/yTPql82lXyOpbyX63Xgn)
- ![Docker 1](https://youtu.be/31k6AtW-b3Y)

## Container 
- Docker containers are lightweight, standalone, and executable software packages that include everything needed to run a piece of software, including the code, runtime, libraries, and system tools
- Docker Demon is the actual docker it actually makes the containers , scaleup the containers as well as scaled down the containers 
- in cmd `docker run -it ubuntu` here if the ubuntu is not there than its gonna download the light version of the ubuntu and run it on your docker container
- if we run the command again than it will check for the ubuntu image and create an another container 
- if its not there than it will download the resources form the hub.docker.com here all the public containers will be there its like a github 
-  ![docker for ubuntu](https://hub.docker.com/search?q=ubuntu) its anubuntu image
- ` Docker images are the basis for containers, and containers are the running instances of Docker images`
- containers are completely isolated
- its like lets say we have a machine and we have OS like windows 10 or something now in case of docker the containers are the machines and the images are the OS
- Containers are completely isolated
- we can create our own custom Image and ask the developers to run that image on tehre local 
- `docker container ls` will show me the containers that are running 
- `docker container ls -a` will show me the containers even if its not running 
- `docker exec -it priceless_dijkstra bash` this will execute a command in my container and it wont disconnct the connection between the container and my local machine (-it means interactive)
- `docker images` to see all the images that are present in my system 
- `docker run -it node` for node
- Port Mapping - here let say my node js applicatio is running on 8000 port in my container but now i want to run my 8000 port to my computers 8000 port than we have to do `docker run -it -p 8000:8000` here we are exposing the port 8000
## Steps for dockerization
  1. create Dockerfile file as name
