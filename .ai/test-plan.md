# Plan Testów – 10x-cards

## 1. Wprowadzenie i cele testowania

Celem testowania jest potwierdzenie, że aplikacja 10x-cards spełnia wymagania funkcjonalne i niefunkcjonalne, zapewnia wysoką jakość, bezpieczeństwo oraz wydajność. Testy mają wykryć błędy zarówno w warstwie frontendowej (Astro, React, TypeScript, Tailwind, Shadcn/ui) jak i backendowej (Supabase, komunikacja z Openrouter.ai), gwarantując niezawodność wdrożenia w środowisku produkcyjnym.

## 2. Zakres testów

- **Testy funkcjonalne:** Weryfikacja kluczowych funkcjonalności, takich jak:
  - Logowanie i uwierzytelnianie użytkownika.
  - Zarządzanie grupami flashcardów (tworzenie, edycja, usuwanie, szczegółowy widok).
  - Tworzenie flashcardów – zarówno ręczne, jak i generowane przez AI.
  - Walidacja formularzy, komunikacja z API i obsługa błędów.
- **Testy integracyjne:** Sprawdzenie poprawności współpracy pomiędzy warstwami frontend i backend oraz integracji z zewnętrznymi usługami (Openrouter.ai).
- **Testy wydajnościowe:** Testy obciążeniowe API, weryfikacja mechanizmu paginacji i indeksów w bazie danych.
- **Testy bezpieczeństwa:** Weryfikacja mechanizmów RLS w Supabase, autoryzacji przy użyciu JWT, walidacji danych wejściowych oraz ochrony przed atakami.
- **Testy UI/UX:** Sprawdzenie responsywności, dostępności (ARIA) oraz poprawności działania dynamicznych elementów interfejsu (np. breadcrumbs, modale, mechanizm pollingowy).

## 3. Typy testów do przeprowadzenia

- **Testy jednostkowe:** Testy pojedynczych komponentów (np. komponentów React, funkcji utilitarnych w `src/lib/utils`) z użyciem narzędzi takich jak Jest i React Testing Library.
- **Testy integracyjne:** Testy przepływu danych między komponentami oraz komunikacji z API (np. testy dla endpointów w `/src/pages/api/flashcards.ts` i `/src/pages/api/flashcards/ai.ts`).
- **Testy end-to-end (E2E):** Symulacja pełnych scenariuszy użytkownika (logowanie, przejście do widoku grup, generowanie flashcardów) przy użyciu narzędzi takich jak Cypress.
- **Testy wydajnościowe:** Testy obciążeniowe API oraz responsywności interfejsu użytkownika.
- **Testy bezpieczeństwa:** Audyt przepływów uwierzytelniania, weryfikacja restrykcji RLS, testowanie walidacji danych i odporności na ataki (np. SQL Injection).

## 4. Scenariusze testowe dla kluczowych funkcjonalności

1. **Logowanie i uwierzytelnianie:**
   - Poprawne dane logowania – oczekiwany wynik: przekierowanie do widoku listy grup.
   - Błędne dane logowania – oczekiwany wynik: wyświetlenie komunikatu o błędzie.
   - Sprawdzenie mechanizmu wygaśnięcia sesji – automatyczne przekierowanie do strony logowania.
2. **Zarządzanie grupami flashcardów:**
   - Tworzenie nowej grupy – walidacja nazwy, komunikaty o błędach przy niepoprawnych danych.
   - Edycja nazwy grupy – aktualizacja danych w interfejsie oraz backendzie.
   - Usuwanie grupy – potwierdzenie operacji i weryfikacja usunięcia powiązanych flashcardów.
   - Pobieranie szczegółów grupy – weryfikacja poprawności danych i obsługa błędów (np. 404 jeśli grupa nie istnieje).
3. **Tworzenie flashcardów:**
   - Ręczne dodawanie flashcardu – walidacja danych (maksymalnie 100 znaków), automatyczna akceptacja.
   - Generowanie flashcardów przez AI – walidacja promptu (min. 50, max. 1000 znaków) oraz liczby kart (maks. 50), weryfikacja statusu „pending approval”.
   - Polling – testowanie mechanizmu odświeżania listy flashcardów.
4. **Interfejs użytkownika:**
   - Responsywność i poprawność wyświetlania na różnych urządzeniach.
   - Dynamiczne breadcrumbs – weryfikacja poprawności nawigacji.
   - Modale i formularze – poprawne otwieranie, walidacja i zamykanie z wyświetlaniem komunikatów o błędach.

## 5. Środowisko testowe

- **Lokalne:** Uruchomienie aplikacji przy użyciu `npm run dev` z wykorzystaniem lokalnego serwera Astro.
- **Testowe:** Środowisko CI/CD (Github Actions) symulujące warunki produkcyjne.
- **Przeglądarki:** Testy w najpopularniejszych przeglądarkach (Chrome, Firefox, Safari) na systemie macOS.
- **Baza danych:** Testowa instancja Supabase z odpowiednimi konfiguracjami RLS.

## 6. Narzędzia do testowania

- **Testy jednostkowe i integracyjne:**
  - Vitest (szybszy i lepiej zintegrowany z TypeScript niż Jest)
  - React Testing Library
  - MSW (Mock Service Worker) do mockowania API
  - Storybook do testowania i dokumentacji komponentów
- **Testy E2E:**
  - Playwright (lepsze wsparcie cross-browser i niezawodność niż Cypress)
  - Axe do testów dostępności
- **Testy wydajnościowe:**
  - Artillery (lepsze wsparcie dla Node.js niż JMeter/k6)
  - Lighthouse CI do pomiarów wydajności frontendu
- **Testy bezpieczeństwa:**
  - OWASP ZAP
  - Snyk dla skanowania zależności
  - SonarQube do analizy statycznej kodu
- **CI/CD:**
  - Github Actions z następującymi krokami:
    - Uruchomienie testów jednostkowych i integracyjnych
    - Uruchomienie testów E2E na różnych przeglądarkach
    - Generowanie i publikacja raportów z testów
    - Analiza pokrycia kodu
    - Skanowanie bezpieczeństwa
- **Środowisko testowe:**
  - Docker Compose do spójnego środowiska testowego
  - Testcontainers dla izolowanych testów integracyjnych

## 7. Harmonogram testów

- **Faza 1 – Testy jednostkowe i komponentów:**
  - Implementacja testów Vitest
  - Konfiguracja Storybook i dokumentacja komponentów
  - Osiągnięcie minimum 80% pokrycia kodu
- **Faza 2 – Testy integracyjne:**
  - Implementacja testów z MSW do mockowania API
  - Testy integracji z Supabase używając Testcontainers
- **Faza 3 – Testy E2E:**
  - Implementacja scenariuszy w Playwright
  - Testy dostępności z Axe
  - Testy cross-browser na głównych przeglądarkach
- **Faza 4 – Testy wydajnościowe i bezpieczeństwa:**
  - Konfiguracja Artillery do testów obciążeniowych
  - Implementacja testów Lighthouse CI
  - Audyt bezpieczeństwa z OWASP ZAP i Snyk

## 8. Kryteria akceptacji testów

- Wszystkie testy jednostkowe i integracyjne muszą przejść bez błędów.
- Testy E2E muszą wykazać, że kluczowe scenariusze użytkownika działają poprawnie.
- Aplikacja musi spełniać założone wymagania wydajnościowe (czas odpowiedzi API poniżej przyjętych progów).
- Żaden krytyczny błąd bezpieczeństwa nie może pozostać nierozwiązany.
- Szczegółowe raporty z testów muszą być dostępne dla zespołu QA i programistów.

## 9. Role i odpowiedzialności

- **Inżynier QA:** Przygotowanie, uruchamianie i analiza testów; przygotowanie raportów; współpraca z zespołem deweloperskim w celu szybkiego rozwiązywania znalezionych błędów.
- **Deweloperzy:** Odpowiedzialność za pisanie testów jednostkowych i integracyjnych, reagowanie na zgłoszone błędy.
- **Testerzy E2E:** Przygotowanie i uruchamianie testów end-to-end; weryfikacja całościowych scenariuszy użytkownika.
- **Specjalista ds. bezpieczeństwa:** Przeprowadzanie testów bezpieczeństwa, audyt konfiguracji RLS oraz walidacja środków ochronnych.

## 10. Procedury raportowania błędów

- Wszystkie błędy wykryte podczas testów będą zgłaszane poprzez system zarządzania błędami (np. GitHub Issues lub dedykowane narzędzie JIRA).
- Raport zawiera szczegółowy opis błędu, kroki reprodukcji, oczekiwany i rzeczywisty wynik oraz zrzuty ekranu (jeśli konieczne).
- Krytyczne błędy będą oznaczane jako blokujące i zgłoszone bezpośrednio do zespołu deweloperskiego z priorytetem najwyższym.
- Regularne spotkania podsumowujące status testów i postępy w naprawie błędów.
