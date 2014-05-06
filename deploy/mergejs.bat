del *.js
cd ..
cd js
TYPE *.js >> ../deploy/skull.js
cd..
cd deploy
java -jar yuicompressor-2.4.8.jar skull.js -o skull.min.js