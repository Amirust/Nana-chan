# Nana-chan
Discord бот для Megu.co

### Предложения, баги и прочее
Пожалуйста, делайте все на гитхабе [вот здесь](https://github.com/Amirust/Nana-chan/discussions) <br>
В крайнем случае уже пингуйте меня на сервере, но рассписывайте сразу что хотите, шаблон возьмите по ссылке выше

----
Требуемые ENV переменные
```bash
export NANA_TOKEN = ... // Токен бота
export MONGO = ... // URL для подключения к MongoDB
```
Компиляция (РАБОТАЕТ **ТОЛЬКО** НА UNIX-СИСТЕМАХ)
```bash
npm run build
```
Запуск с под докера
```bash
sudo docker build . -t nana/bot --build-arg NANA_TOKEN=ТОКЕН_БОТА --build-arg MONGO=URL_МОНГИ
```
