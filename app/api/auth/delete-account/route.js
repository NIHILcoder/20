export async function DELETE(request) {
  try {
    // В реальном приложении здесь будет логика удаления аккаунта из базы данных
    // Например, получение ID пользователя из сессии и удаление всех связанных данных
    
    // Имитация успешного удаления
    return new Response(JSON.stringify({ success: true, message: 'Аккаунт успешно удален' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Ошибка при удалении аккаунта:', error);
    
    // Возвращаем ошибку в формате JSON, а не HTML
    return new Response(JSON.stringify({ success: false, error: error.message || 'Произошла ошибка при удалении аккаунта' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}