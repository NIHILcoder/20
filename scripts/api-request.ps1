# Скрипт для выполнения HTTP-запроса к API сообщества

# Вариант 1: Заключение всего URL в двойные кавычки
Write-Host "Вариант 1: Заключение всего URL в двойные кавычки"
Invoke-WebRequest -Uri "http://localhost:3001/api/community?limit=12&offset=0&sortBy=newest" -Method GET

# Вариант 2: Использование экранирования для амперсандов
Write-Host "\nВариант 2: Использование экранирования для амперсандов"
Invoke-WebRequest -Uri http://localhost:3001/api/community`?limit=12`&offset=0`&sortBy=newest -Method GET

# Вариант 3: Создание объекта URI с параметрами запроса
Write-Host "\nВариант 3: Создание объекта URI с параметрами запроса"
$baseUri = "http://localhost:3001/api/community"
$uriBuilder = [System.UriBuilder]::new($baseUri)
$query = [System.Web.HttpUtility]::ParseQueryString("")
$query.Add("limit", "12")
$query.Add("offset", "0")
$query.Add("sortBy", "newest")
$uriBuilder.Query = $query.ToString()

Invoke-WebRequest -Uri $uriBuilder.Uri.ToString() -Method GET

Write-Host "\nПримечание: Для использования варианта 3 может потребоваться добавить сборку System.Web:"
Write-Host "Add-Type -AssemblyName System.Web"