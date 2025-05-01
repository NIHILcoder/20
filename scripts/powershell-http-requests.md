# Выполнение HTTP-запросов в PowerShell с параметрами URL

## Проблема с амперсандами в URL

В PowerShell амперсанд (`&`) является специальным оператором, зарезервированным для будущих версий. При использовании URL с параметрами запроса (query parameters), которые разделяются амперсандами, возникает ошибка синтаксиса:

```
Амперсанд (&) не разрешен. Оператор & зарезервирован для будущих версий. Добавьте двойные кавычки до и после амперсанда ("&"), чтобы передать его как строку.
```

## Решения

### 1. Заключение всего URL в двойные кавычки (рекомендуемый способ)

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/community?limit=12&offset=0&sortBy=newest" -Method GET
```

### 2. Использование обратного апострофа (`) для экранирования амперсандов

```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/community`?limit=12`&offset=0`&sortBy=newest -Method GET
```

### 3. Создание объекта URI с параметрами запроса

```powershell
# Сначала добавляем необходимую сборку
Add-Type -AssemblyName System.Web

# Создаем базовый URI и добавляем параметры
$baseUri = "http://localhost:3001/api/community"
$uriBuilder = [System.UriBuilder]::new($baseUri)
$query = [System.Web.HttpUtility]::ParseQueryString("")
$query.Add("limit", "12")
$query.Add("offset", "0")
$query.Add("sortBy", "newest")
$uriBuilder.Query = $query.ToString()

# Выполняем запрос с построенным URI
Invoke-WebRequest -Uri $uriBuilder.Uri.ToString() -Method GET
```

## Дополнительные рекомендации

- Для сложных запросов с множеством параметров рекомендуется использовать третий способ
- При работе с API, требующими аутентификации, добавляйте соответствующие заголовки
- Для обработки ответа используйте свойства возвращаемого объекта, например:
  ```powershell
  $response = Invoke-WebRequest -Uri "http://localhost:3001/api/community?limit=12&offset=0&sortBy=newest" -Method GET
  $content = $response.Content | ConvertFrom-Json
  $content
  ```

## Готовый пример для вашего API

```powershell
# Выполнение запроса к API сообщества
$response = Invoke-WebRequest -Uri "http://localhost:3001/api/community?limit=12&offset=0&sortBy=newest" -Method GET

# Преобразование ответа из JSON
$communityData = $response.Content | ConvertFrom-Json

# Вывод результатов
$communityData
```