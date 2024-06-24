# Version 3.1 Ranking extended up to 10 players (Server-Side)
![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/fd4bff7b-82a1-4c32-be44-b9816b002f9a)

## Hosting [server-side version](https://github.com/matiwan3/project-shark-roulette/blob/feature/server-side/readme.md) on raspberryPi (Server-side)
1. connect via ssh
2. ```sudo apt install nodejs```  
3. ```sudo apt install npm``` 
4. node -v
5. npm -v  
   ![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/60947095-7b45-4d6c-8511-115ca775a316)

6. cat > creds.js (add required values)  
```
const login= "loginValue";
const pass = "passwordValue";

const login_user = "yourmongoDbString";

module.exports = { login, pass, login_user };
```
7. to init node_modules use  ```npm install```   
8. Create a shell executable file to run the whole environment
8.0 create a start-env.sh file 
![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/f4b548b5-49a9-4268-a8ab-5cb28713c098)



8.1 Kill the process if any running on port 5500
```
matiwan@raspberrypi:~/Desktop/project-shark-roulette $ sudo kill -9 9584
matiwan@raspberrypi:~/Desktop/project-shark-roulette $ sudo lsof -i :5500
```
# Version 3.0
Patch Notes: Added backend (server side), added mongoDB integration to keep the ranking up to date. **Unfortunately github pages can't host server side applications**, therefore you can only preview it [in this branch](https://github.com/matiwan3/project-shark-roulette/tree/feature/server-side)
![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/177f6e65-cb70-4ba9-bb2d-0602f82a049a)
![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/5b8bc1b2-ba25-490e-810b-12f1fb225d20)


# Version 1.0
![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/6232498a-d451-4772-8d71-d8cbd5c7090b)
