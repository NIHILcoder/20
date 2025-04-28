export async function GET(request) {
  try {
    // В реальном приложении здесь будет получение информации о подписке пользователя из базы данных
    // Для демонстрации возвращаем тестовые данные
    
    const subscription = {
      plan: 'pro',
      status: 'active',
      nextBillingDate: '2025-04-15',
      credits: {
        total: 1000,
        used: 248
      },
      features: [
        'Доступ ко всем моделям',
        'Максимальное разрешение: 2048×2048',
        'Приоритетная очередь генерации',
        'Расширенные параметры',
        'Коммерческая лицензия',
        'Доступ к API'
      ]
    };
    
    return new Response(JSON.stringify({ success: true, subscription }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Ошибка при получении информации о подписке:', error);
    
    return new Response(JSON.stringify({ success: false, error: error.message || 'Произошла ошибка при получении информации о подписке' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request) {
  try {
    // Получаем данные из запроса
    const data = await request.json();
    const { planId } = data;
    
    if (!planId) {
      return new Response(JSON.stringify({ success: false, error: 'ID плана не указан' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // В реальном приложении здесь будет логика изменения плана подписки в базе данных
    // и взаимодействие с платежной системой
    
    // Имитация успешного изменения плана
    const plans = {
      free: {
        name: 'Бесплатный',
        credits: 100
      },
      pro: {
        name: 'Про',
        credits: 1000
      },
      business: {
        name: 'Бизнес',
        credits: 5000
      }
    };
    
    const selectedPlan = plans[planId];
    
    if (!selectedPlan) {
      return new Response(JSON.stringify({ success: false, error: 'Указанный план не существует' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `План успешно изменен на ${selectedPlan.name}`,
      subscription: {
        plan: planId,
        status: 'active',
        nextBillingDate: '2025-05-15',
        credits: {
          total: selectedPlan.credits,
          used: 0
        }
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Ошибка при изменении плана подписки:', error);
    
    return new Response(JSON.stringify({ success: false, error: error.message || 'Произошла ошибка при изменении плана подписки' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}