cd deploy
del *.js
cd ..
TYPE *.js >> deploy/bfApp.js
java -jar deploy/yuicompressor-2.4.8.jar deploy/bfApp.js -o deploy/bfApp.min.js