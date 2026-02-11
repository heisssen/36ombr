#!/usr/bin/env python3
"""
Скрипт для скрапінгу вакансій з 36obrmp.lobbyx.army
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time
import sys
from urllib.parse import urljoin

# Заголовки браузера для уникнення блокування
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
}


def get_vacancy_links(base_url):
    """Отримує всі посилання на вакансії з головної сторінки разом з тегами"""
    print(f"Завантажуємо головну сторінку: {base_url}")
    
    session = requests.Session()
    session.headers.update(HEADERS)
    
    response = session.get(base_url, timeout=30)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Знаходимо всі посилання на вакансії
    vacancies_data = []
    seen_urls = set()
    
    # Шукаємо всі посилання, які ведуть на lobbyx.army/tor/
    for link in soup.find_all('a', href=True):
        href = link['href']
        if '/tor/' in href:
            full_url = urljoin(base_url, href)
            
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)
            
            # Витягуємо теги з того ж елемента або його нащадків
            tags = []
            
            # Теги можуть бути в тексті лінка як хештеги
            link_text = link.get_text()
            hashtags = re.findall(r'#[а-яА-ЯіїєґІЇЄҐa-zA-Z0-9/_-]+', link_text)
            tags.extend(hashtags)
            
            # Також шукаємо теги в елементах після назви вакансії
            # (вони зазвичай йдуть після заголовка вакансії)
            parent = link.parent
            if parent:
                # Шукаємо всі хештеги в батьківському елементі
                parent_text = parent.get_text()
                parent_hashtags = re.findall(r'#[а-яА-ЯіїєґІЇЄҐa-zA-Z0-9/_-]+', parent_text)
                for tag in parent_hashtags:
                    if tag not in tags:
                        tags.append(tag)
            
            vacancies_data.append({
                'url': full_url,
                'tags': tags
            })
    
    print(f"Знайдено {len(vacancies_data)} вакансій")
    return vacancies_data


def scrape_vacancy(url, tags=None):
    """Скрапить деталі однієї вакансії"""
    print(f"Обробляємо: {url}")
    
    try:
        session = requests.Session()
        session.headers.update(HEADERS)
        
        response = session.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        vacancy = {
            'url': url,
            'title': '',
            'tags': tags if tags else [],
            'overview': '',
            'duties': '',
            'requirements': '',
            'conditions': '',
            'raw_text': ''
        }
        
        # Назва вакансії (h1)
        title_tag = soup.find('h1')
        if title_tag:
            vacancy['title'] = title_tag.get_text(strip=True)
        
        # Весь текст сторінки для raw_text
        body = soup.find('body')
        if body:
            vacancy['raw_text'] = body.get_text(separator='\n', strip=True)
        
        # Шукаємо всі заголовки h2
        headings = soup.find_all('h2')
        
        for heading in headings:
            heading_text = heading.get_text(strip=True)
            
            # Знаходимо наступний елемент після заголовка
            next_elem = heading.find_next_sibling()
            
            if not next_elem:
                continue
            
            # Витягуємо вміст секції
            content_parts = []
            
            # Якщо це список (ul/ol)
            if next_elem.name in ['ul', 'ol']:
                items = next_elem.find_all('li')
                content_parts = [item.get_text(strip=True) for item in items if item.get_text(strip=True)]
            # Якщо це параграф або інший текстовий елемент
            else:
                current = next_elem
                while current and current.name not in ['h2', 'h3']:
                    if current.name in ['p', 'div']:
                        text = current.get_text(strip=True)
                        if text:
                            content_parts.append(text)
                    elif current.name in ['ul', 'ol']:
                        items = current.find_all('li')
                        for item in items:
                            text = item.get_text(strip=True)
                            if text:
                                content_parts.append(text)
                    current = current.find_next_sibling()
                    if not current:
                        break
            
            content = '\n'.join(content_parts) if content_parts else ''
            
            # Розподіляємо по полях
            if 'огляд' in heading_text.lower() or 'overview' in heading_text.lower():
                vacancy['overview'] = content
            elif 'обов\'язк' in heading_text.lower() or 'обовязк' in heading_text.lower():
                vacancy['duties'] = content
            elif 'вимог' in heading_text.lower() or 'requirement' in heading_text.lower():
                vacancy['requirements'] = content
            elif 'умов' in heading_text.lower() or 'condition' in heading_text.lower():
                vacancy['conditions'] = content
        
        return vacancy
        
    except Exception as e:
        print(f"Помилка при обробці {url}: {e}")
        return {
            'url': url,
            'error': str(e)
        }


def main():
    """Головна функція"""
    base_url = 'https://36obrmp.lobbyx.army/'
    
    # Перевірка аргументів командного рядка
    test_mode = '--test' in sys.argv
    limit = None
    
    if test_mode:
        limit = 5
        print("ТЕСТОВИЙ РЕЖИМ: оброблюємо тільки перші 5 вакансій")
    
    print("=" * 60)
    print("Скрапінг вакансій з 36obrmp.lobbyx.army")
    print("=" * 60)
    
    # Отримуємо список вакансій з тегами
    vacancies_data = get_vacancy_links(base_url)
    
    if not vacancies_data:
        print("Вакансії не знайдено!")
        return
    
    # Обмежуємо кількість у тестовому режимі
    if limit:
        vacancies_data = vacancies_data[:limit]
        print(f"Обробляємо перші {limit} вакансій")
    
    # Скрапимо кожну вакансію
    all_vacancies = []
    
    for i, vac_data in enumerate(vacancies_data, 1):
        url = vac_data['url']
        tags = vac_data['tags']
        
        print(f"\n[{i}/{len(vacancies_data)}] ", end='')
        
        # Додаємо повторні спроби у випадку помилок
        for attempt in range(3):
            try:
                vacancy = scrape_vacancy(url, tags)
                all_vacancies.append(vacancy)
                break
            except Exception as e:
                if attempt < 2:
                    print(f"Спроба {attempt + 1} не вдалася, повторюємо...")
                    time.sleep(2)
                else:
                    print(f"Помилка після 3 спроб: {e}")
                    all_vacancies.append({
                        'url': url,
                        'tags': tags,
                        'error': str(e)
                    })
        
        # Пауза між запитами (1-2 секунди)
        time.sleep(1 + (i % 2))
    
    # Зберігаємо в JSON
    output_file = 'vacancies_test.json' if test_mode else 'vacancies.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_vacancies, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"Готово! Зібрано {len(all_vacancies)} вакансій")
    print(f"Результат збережено у файл: {output_file}")
    print("=" * 60)
    
    # Виводимо статистику
    successful = sum(1 for v in all_vacancies if 'error' not in v)
    failed = len(all_vacancies) - successful
    
    print(f"\nУспішно оброблено: {successful}")
    if failed > 0:
        print(f"Помилок: {failed}")
    
    # Приклад першої вакансії
    if all_vacancies and 'error' not in all_vacancies[0]:
        print(f"\nПриклад (перша вакансія):")
        print(f"Назва: {all_vacancies[0]['title']}")
        print(f"Теги: {', '.join(all_vacancies[0]['tags'])}")
        if all_vacancies[0].get('overview'):
            print(f"Огляд: {all_vacancies[0]['overview'][:100]}...")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nПерервано користувачем")
        sys.exit(0)
    except Exception as e:
        print(f"\n\nКритична помилка: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)