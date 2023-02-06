# export AWS_DEFAULT_PROFILE=liberate-django

rm -rf dist
npm i
npm install -g esbuild
VERSION=$(date +'%Y-%m-%d-%H-%M')

esbuild src/handler.ts --bundle --sourcemap --platform=node --target=es2020 --outfile=dist/index.js
zip -j ${VERSION}.zip ./dist/*

aws s3 cp ${VERSION}.zip s3://liberate-lambda-s3-bucket/dwolla-webhook-handler/release-${VERSION}.zip

rm ${VERSION}.zip

aws lambda update-function-code --function-name=dwolla-webhook-handler --s3-bucket=liberate-lambda-s3-bucket --s3-key=dwolla-webhook-handler/release-${VERSION}.zip