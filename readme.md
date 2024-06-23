## Hosting server-side version on raspberryPi
1. connect via ssh
2. ```sudo apt install nodejs```  
3. ```sudo apt install npm``` 
4. node -v
5. npm -v  
   ![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/60947095-7b45-4d6c-8511-115ca775a316)

7. cat > creds.js (add required values)  
```
const login= "loginValue";
const pass = "passwordValue";

const login_user = "yourmongoDbString";

module.exports = { login, pass, login_user };
```
7. Run html local server on port 3000. navigate to index.html location and run:   
```npm install http-server -g```
```http-server index.html -p 3000 ```  
???

# Version 3.0
Patch Notes: Added backend (server side), added mongoDB integration to keep the ranking up to date. **Unfortunately github pages can't host server side applications**, therefore you can only preview it [in this branch](https://github.com/matiwan3/project-shark-roulette/tree/feature/server-side)
![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/177f6e65-cb70-4ba9-bb2d-0602f82a049a)
![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/5b8bc1b2-ba25-490e-810b-12f1fb225d20)


# Version 1.0
![image](https://github.com/matiwan3/project-shark-roulette/assets/93386476/6232498a-d451-4772-8d71-d8cbd5c7090b)
