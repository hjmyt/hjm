"""Compare Spanish speech transcripts without treating 200/doscientos as errors."""
import re
import unicodedata

def number_words(n):
    small = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciseis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidos','veintitres','veinticuatro','veinticinco','veintiseis','veintisiete','veintiocho','veintinueve']
    if n < 30: return small[n]
    if n < 100:
        return ['', '', '', 'treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'][n//10] + (' y '+small[n%10] if n%10 else '')
    if n == 100: return 'cien'
    if n < 1000:
        return ['', 'ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'][n//100] + (' '+number_words(n%100) if n%100 else '')
    if n < 10000:
        return (number_words(n//1000)+' ' if n>=2000 else '')+'mil'+(' '+number_words(n%1000) if n%1000 else '')
    return str(n)

def normalize(text):
    text = re.sub(r'\b\d+\b', lambda m:number_words(int(m.group())), text.lower())
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode())
