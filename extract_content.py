
import json
from bs4 import BeautifulSoup
import os

def extract_text(element):
    return element.get_text(strip=True) if element else ""

def extract_html(element):
    return str(element) if element else ""

def parse_index(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    content = {}

    # Hero Section
    hero = soup.find('section', id='hero') or soup.find('section', class_='hero')
    if hero:
        content['hero'] = {
            "title": {
                "type": "text",
                "label": "Hero Title",
                "value": extract_text(hero.find('h1'))
            },
            "subtitle": {
                "type": "textarea",
                "label": "Hero Subtitle",
                "value": extract_text(hero.find('p', class_='hero-subtitle'))
            },
            "cta_button_text": {
                "type": "text",
                "label": "CTA Button Text",
                "value": extract_text(hero.find('a', class_='btn-primary'))
            },
             "cta_button_link": {
                "type": "text",
                "label": "CTA Button Link",
                "value": hero.find('a', class_='btn-primary')['href'] if hero.find('a', class_='btn-primary') else ""
            }
        }

    # About Section
    about = soup.find('section', id='about')
    if about:
        content['about'] = {
            "label": {
                "type": "text",
                "label": "About Label",
                "value": extract_text(about.find('span', class_='about-label'))
            },
            "headline": {
                "type": "textarea",
                "label": "About Headline",
                "value": extract_html(about.find('h2', class_='about-headline')) # Keeping HTML for <br> tags
            },
            "lead": {
                "type": "textarea",
                "label": "About Lead Paragraph",
                "value": extract_html(about.find('p', class_='about-lead')) # Keeping HTML for <strong> tags
            },
            "body": {
                "type": "textarea",
                "label": "About Body Paragraph",
                "value": extract_text(about.find('p', class_='about-body'))
            },
             "quote": {
                "type": "textarea",
                "label": "About Quote",
                "value": extract_text(about.find('blockquote', class_='about-quote'))
            }
        }

    # Path Section
    path = soup.find('section', id='path')
    if path:
        content['path'] = {
            "title": {
                "type": "text",
                "label": "Path Section Title",
                "value": extract_text(path.find('h2', class_='section-title'))
            },
            "subtitle": {
                "type": "text",
                "label": "Path Section Subtitle",
                "value": extract_text(path.find('p', class_='section-subtitle'))
            },
            "cards": {
                "type": "list",
                "label": "Path Cards",
                "items": []
            }
        }
        for card in path.find_all('div', class_='path-card'):
            item = {
                "title": extract_text(card.find('h3')),
                "description": extract_text(card.find('p', class_='path-desc')),
                "features": [extract_text(li) for li in card.find_all('li')],
                "button_text": extract_text(card.find('a', class_='btn-path')),
                "button_link": card.find('a', class_='btn-path')['href'] if card.find('a', class_='btn-path') else ""
            }
            content['path']['cards']['items'].append(item)

    # Gallery Section
    gallery = soup.find('section', id='gallery')
    if gallery:
        content['gallery'] = {
            "title": {
                "type": "text",
                "label": "Gallery Title",
                "value": extract_text(gallery.find('h2', class_='section-title'))
            },
            "subtitle": {
                "type": "text",
                "label": "Gallery Subtitle",
                "value": extract_text(gallery.find('p', class_='section-subtitle'))
            }
        }

    # Vacancies Section
    vacancies = soup.find('section', id='vacancies')
    if vacancies:
        content['vacancies'] = {
            "title": {
                 "type": "text",
                 "label": "Vacancies Title",
                 "value": extract_text(vacancies.find('h2', class_='section-title'))
            },
            "subtitle": {
                 "type": "text",
                 "label": "Vacancies Subtitle",
                 "value": extract_text(vacancies.find('p', class_='section-subtitle'))
            }
        }

    # Reviews Section
    reviews = soup.find('section', id='reviews')
    if reviews:
        content['reviews'] = {
            "title": {
                 "type": "text",
                 "label": "Reviews Title",
                 "value": extract_text(reviews.find('h2', class_='section-title'))
            },
             "subtitle": {
                 "type": "text",
                 "label": "Reviews Subtitle",
                 "value": extract_text(reviews.find('p', class_='section-subtitle'))
            },
            "items": {
                "type": "list",
                "label": "Review Items",
                "items": []
            }
        }
        for review in reviews.find_all('div', class_='review-card'):
            item = {
                "author": extract_text(review.find('h4')),
                 "position": extract_text(review.find('p')), # This might need refinement if structure varies
                 "text": extract_text(review.find('p', class_='review-text')),
                 "date": extract_text(review.find('span', class_='review-date'))
            }
            # Clean up position text to remove name part if caught
            # Based on structure: <div><h4>Name</h4><p>Pos</p></div>
            item['position'] = extract_text(review.find('div', class_='review-author').find_all('p')[-1]) if review.find('div', class_='review-author') else ""
            
            content['reviews']['items']['items'].append(item)

    # FAQ Section
    faq = soup.find('section', id='faq')
    if faq:
        content['faq'] = {
            "title": {
                 "type": "text",
                 "label": "FAQ Title",
                 "value": extract_text(faq.find('h2', class_='section-title'))
            },
            "subtitle": {
                 "type": "text",
                 "label": "FAQ Subtitle",
                 "value": extract_text(faq.find('p', class_='section-subtitle'))
            },
            "items": {
                "type": "list",
                "label": "FAQ Items",
                "items": []
            }
        }
        for item in faq.find_all('div', class_='faq-item'):
            faq_item = {
                "question": extract_text(item.find('h3')),
                "answer": extract_text(item.find('div', class_='faq-answer'))
            }
            content['faq']['items']['items'].append(faq_item)

    # Contacts Section
    contacts = soup.find('section', id='contacts')
    if contacts:
        content['contacts'] = {
            "title": {
                 "type": "text",
                 "label": "Contacts Title",
                 "value": extract_text(contacts.find('h2', class_='section-title'))
            },
             "subtitle": {
                 "type": "text",
                 "label": "Contacts Subtitle",
                 "value": extract_text(contacts.find('p', class_='section-subtitle'))
            },
             "phone": {
                 "type": "text",
                 "label": "Phone Number",
                 "value": extract_text(contacts.find('a', href=lambda x: x and x.startswith('tel:')))
             },
             "email": {
                 "type": "text",
                 "label": "Email",
                 "value": extract_text(contacts.find('a', href=lambda x: x and x.startswith('mailto:')))
             },
             "address": {
                 "type": "text",
                 "label": "Address",
                 "value": extract_text(contacts.find('span', {'data-icon': 'mdi:map-marker'}).find_parent('div', class_='contact-block').find('p')) if contacts.find('span', {'data-icon': 'mdi:map-marker'}) else ""
             }
        }

    return content

def parse_generic_page(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    content = {}
    
    # Generic Content Section (often used in other pages)
    content_section = soup.find('section', class_='content-section')
    if content_section:
        paragraphs = []
        for p in content_section.find_all('p'):
             # Filter out contact info blocks or address-like paragraphs
             if p.find_parent('div', class_='contact-info-block'):
                 continue
             text = extract_text(p)
             if "Миколаїв, вул." in text: # Simple heuristic to skip address if it appears as a P
                 continue
             paragraphs.append(text)

        content['main_content'] = {
             "title": {
                 "type": "text",
                 "label": "Page Title",
                 "value": extract_text(content_section.find('h2', class_='content-title'))
             },
             "paragraphs": {
                 "type": "list",
                 "label": "Content Paragraphs",
                 "items": paragraphs
             }
        }
        
    return content

def main():
    site_content = {
        "index": parse_index('/mnt/Data/36site/index.html'),
        "contract_18_24": parse_generic_page('/mnt/Data/36site/contract-18-24.html'),
        "direct_recruiting": parse_generic_page('/mnt/Data/36site/direct-recruiting.html'),
        "career": parse_generic_page('/mnt/Data/36site/career.html')
    }

    with open('site_content.json', 'w', encoding='utf-8') as f:
        json.dump(site_content, f, ensure_ascii=False, indent=2)
    
    print("site_content.json created successfully.")

if __name__ == "__main__":
    main()
