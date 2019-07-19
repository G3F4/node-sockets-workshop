# warsawjs-workshop-34-trainer-needed

## 1. Serwer http z plikami statycznymi

Do rozpoczęcia pracy potrzebny jest serwer obsługujący protokuł http. 
Dodać prosty serwer serwujący pliku statyczne z folderu `public`.

* `src/index.ts`

  * Hello world serwera http
  
    * Utworzyć serwer przy wykorzystaniu funkcji `createServer` ze wbudowanego modułu `http` 
  
      * Zapisać do stałej `server`
        
      * Przekazać handler serwera w postaci funkcji `(request, response) => {...}`
  
        * Dodać blok `try catch`, który obejmie cały kod handlera
          
          * w przypadku błędu wyświetlić błąd do konsoli
          
          * wysłać odpowiedź w postać `e.toString()` gdzie `e` to wyłapany błąd przez `catch`
        
        * Handler serwera w odpowiedzi na wszystkie zapytania zwraca tekst `Test server` 
        
          * Wykorzystać metodę `end` obiektu `response`
  
    * Dodać nasłuchiwanie wykorzystując metodę `listen` obiektu `server`
      
      * Przekazać jako pierwszy argument stałą `PORT`
      
      * Jako drugi funkcję, która wywoła się po uruchomieniu serwera
      
        * Użyć `console.log` aby sprawdzić czy serwer rozpoczął nasłuchiwanie na porcie
  
  * Modyfikacja handlera serwera, tak aby zwracał pliki statyczne 
  
    * Zapisać do stałej `url` adres URL z obiektu zapytania wykorzystując `request.url` 
    
      * W przypadku gdy adres jest równy `/` ustawić wartość `index.html`
      
        * Wykorzystać operator `? :`
        
    * Utworznie stałej `urlParts` z wartością `url.split('.')`
  
    * Utworznie stałej `fileExtension` z wartością ostatniego elementu tablicy `urlParts`
    
    * Utworznie stałej `contentType` z wartością z mapy `FILE_EXTENSION_TO_CONTENT_TYPE`, której kluczami są rozszerzenia plików
  
    * Ustawić status odpowiedzi wykorzystując metodę `writeHead` obiektu odpowiedzi (drugi argument handlera, zazwyczaj nazywany `res`) 
  
      * Jako pierwszy argument przekazać status odpowiedzi równy `200` 
  
      * Jako drugi argument przekazać obiekt `{ 'Content-Type': contentType }`
  
    * Wczytanie pliku 
  
      * Wykorzystać funckje `readFileSync` ze wbudowanego modułu `fs`  
        
        * Zapisać do stałej `file`
  
        * Jako pierwszy argument przekazać absolutną ścieżkę do pliku 
  
          * Do pobrania ścieżki projektu możesz skorzystać z `proces.cwd()` 
  
    * Wykorzystując metodę `response.end` zakończyć zapytanie przekazując do metody zawartość wczytanego pliku  
  
## 2. Dodanie WebSocketów 

### Serwer: (`/src/index.ts`) 

* Zainstalować pakiet `ws`, który posłuży do obsługi połączenia w technologii `WebSockets` 

* W pliku `index.ts` zaimportować klasę `Server` z pakietu `ws` 

* Utworzyć nową instancję serwera `ws` o nazwie `webSocketsServer` 

  * Przekazać do konstruktora obiekt konfiguracyjny z kluczem `server`, wskazujący na referencje do serwera `HTTP` 

* Dodać do serwera `WebSockets` nasłuchiwanie na `event` połączenia o nazwie `connection` przy wykorzystaniu metody `on` 

  * Klasa `Server` z pakietu `ws` dziedziczy do klasie `EventEmmiter` 

  * Handler eventu `connection` jako argument wywołania dostaje socket, który reprezentuje połączenie z klientem 

  * Handler w reakcji na event połączenia odsyła wiadomość powitalną `connected to socket server` wykorzystując metodę `send` 

    * Jako argument przekazujemy `string` albo `Buffer` 

* Dodać do serwera `WebSockets` nasłuchiwanie na `event` połączenia o nazwie `message` przy wykorzystaniu metody `on` 

  * W reakcji na zdarzenie wypisać do konsoli dane eventu dostępne w polu `data` 

 

### Klient: (`/public/client.js`) 

* Dodać nasłuchiwanie na event `DOMContentLoaded` wykorzystując metodę `addEventListner`  

  * Handler eventu tworzy nowe polaczeniem do serwera `WebSockets` 

    * Utworzyć instancję socketa wykorzystując klasę `WebSockets` o nazwie `socket` 

      * Konstruktor przyjmuje argument typu `string`, który reprezentuje adres serwera `WebSockets` 

    * Zaimplementować obsługę eventów: 

      * `onopen` - wywoływany po ustanowieniu połączenia z serwerem 

        * W reakcji na event klient odsyła wiadomość powitalną `hello server` wykorzystując metodę `send` obiektu `socket` (instancja klasy `WebSockets`) 

      * `onmessage` - wywoływany przy każdej wiadomości serwera 

        * W reakcji na zdarzenie wypisać do konsoli dane eventu dostępne  pod polem `data` obiektu eventu  

      * `onerror` - wywoływany przy każdym błędzie komunikacji z serwerem 

        * W reakcji na zdarzenie wypisać do konsoli błąd  

      * `onclose` - wywoływany w sytuacji kiedy serwer zakończy połączenie z socketem 

        * W reakcji na zdarzenie wypisać do konsoli informację o przerwaniu połączenia z serwerem  

## 3. Autentykacja użytkownika 

### Klient: 

* Dodać ekran powitalny  

  * Dodać funkcję renderującą ekran powitalny `renderLandingView` 
  
    * Zapisać do stałej `rootNode` referencję do węzła o `id="root" wykorzystując `document.getElementById` 
    
    * Analogicznie zrobić z szablonem (`<template id="landing">`), nazwać referenję `landingTemplate` 
    
    * Stworzyć nowy element na podstawie szablonu wykorzystując `document.importNode` - nazwa `landingNode` 
    
      * Jako pierwszy argument przekazać `landingTemplate.content` 
    
      * Jako drugi `true` 
    
    * Wyczyścić zawartośc `rootNode` 
    
      * `rootNode.innerHTML = '';` 
    
    * Dodać do głównego węzła stworzony element: 
    
      * `rootNode.appendChild(landingNode);` 
    
    * Dodać nasłuchiwanie na kliknięcie w element z `id="loginParticipant"` wykorzystując `addEventListener` 
    
      * Stworzyć pustą funkcję `renderParticipantLoginView` 
    
      * Przekazać nową funkcję jako handler zdarzenia kliknięcia 
    
    * Analogicznie dla elementu z `id="loginParticipant"` 

* Ekran logowania uczestnika  

  * Dodać funkcję renderującą ekran logowania uczestnika analogicznie do strony powitalnej - `renderParticipantLoginView` 
  
    * Dodać nasłuchiwanie na event `submit` na elemencie formularza z `id="participantLoginForm"` 
    
      * Postać eventu: 
      
        * `action` o wartości `PARTICIPANT_LOGIN` 
        
        * `payload` o wartości danych z formularza  
        
          * Wykorzystać `FormData` do zebrania danych z formulurza 
          
          * `const formData = new FormData(event.target);` 
          
          * Dostęp do danych `formData.get(group)` gdzie `group` do wartość atrybutu `name` elementu input formularza 
          
          * Nazwy pól w formularzu: 
            
            * `name` 
            
            * `group` 

* Ekran logowania trenera 

  * Dodać funkcję renderującą ekran logowania uczestnika analogicznie do strony powitalnej - `renderTrainerLoginView` 

    * Dodać nasłuchiwanie na event `submit` formularza `id="trainerLoginForm"` 

### Serwer 

Obsługa eventu logowania  

  * Dodać obiekt na poziomie pliku, który będzie reprezentował stan serwera - `state` 
  
    * Dodać pole `users` z inicjalnie pustą tablicą 
  
  * Obiekt reprezentujący podłączonego użytkownika 
  
    * `type` - `PARTICIPANT` lub `TRAINER` 
    
    * `data` - dane zebrane podczas logowania 
    
    * `socket` - referencja do socketa użytkownika 
    
  * Po połączeniu (event `connection`) zapisać do kolekcji nowy socket, zostawiając pola `userType` oraz `userData` puste 
  
  * Dodać prosty system akcji przy wykorzystaniu instrukcji warunkowej `switch` w handlerze eventu `message` 
    
    * Sparsować zawartość pola `data` eventu wykorzystując `JSON.parse` 
    
      * Zapisać do stałych pola obiektu `action` oraz `payload` 
    
    * Wykorzystać `action` w instrukcji `switch` 
      
      * Dodać obsługę akcji `PARTICIPANT_LOGIN` 
      
        * Znaleźć w kolekcji obiekt zawierający socket, który wywołał event `message` 
        
        * Zaktualizować pola `userType` na `PARTICIPANT` 
        
        * Zaktualizować  wartość pola `userData` zawartością `payload` 
        
        * Wysłać akcję `PARTICIPANT_LOGGED` z pustym `payload` 
        
      * Dodać obsługę akcji `TRAINER_LOGIN` 
        
        * Znaleźć w kolekcji obiekt zawierający socket, który wywołał event `message` 
        
        * Zaktualizować pola `userType` na `TRAINER` 
        
        * Zaktualizować  wartość pola `userData` zawartością `payload` 
        
        * Wysłać akcję `TRAINER_LOGGED` z pustym `payload` 

## 4. Wysyłanie sygnału pomocy 

### Klient: 

* Dodać ekran wysyłania sygnału pomocy  

  * Wyświetlić `input` na krótki opis problemu 
  
  * Wyświetlić przycisk z tekstem `Trainer needed` 

* Po zalogowaniu wyświetlić ekran wysyłania sygnału pomocy  

* Dodać obsługę kliknięcia w przycisk `Trainer needed` 

  * Po kliknięciu wysłać event z `action` o wartości  `TRAINER_NEEDED` i `payload` z wartością inputa z opisem problemu  

### Serwer: 

* Dodać kolekcje reprezentującą zgłoszenia uczestników w postaci: 
  
  * `id` - unikalny identyfikator  
  
  * `status` - enum o wartości `RECEVIED` 
  
  * `userId` - identyfikator uczestnika 
  
  * `problem` - opis problemu  

* Dodać obsługę akcji `TRAINER_NEEDED` 
  
  * W odpowiedzi na event dodać nowy element do kolekcji zgłoszeń  
  
  * Wysłać do użytkownika wiadomość o przyjęciu zgłoszenia  

## 5. Wyświetlanie zgłoszeń  

### Serwer 

* Wysyłanie listy zgłoszeń  

  * Po zalogowaniu trenera wysłać event z akcją `ISSUE_LIST` i `payload` z kolekcją zgłoszeń w postaci: 
    
    * `issueId` - identyfikator zgłoszenia 
    
    * `user` 
    
    * `name`  - nazwa uczestnika  
    
    * `group` - numer grupy 
    
    * `problem` - opis problemu  
    
    * `status` - status zgłoszenia 
  
  * Po wystąpieniu akcji `TRAINER_NEEDED` wysłać kolekcje ze zgłoszeniami do wszystkich trenerów w analogicznej do logowania trenera 

### Klient: 

* Dodać ekran z listą zgłoszeń 

  * Ekran do wyświetlania potrzebuje listy zgłoszeń 
  
  * Wyświetlić listę w postaci kolumn z wierszami używając `flex-box` 
    
    * W pierwszej kolumnie nazwę uczestnika  
    
    * W drugiej kolumnie grupę uczestnika 
    
    * W trzeciej kolumnie opis problemu  
    
    * W czwartej kolumnie status zgłoszenia  

* Dodać w evencie `onmessage` obsługę akcji analogicznie do serwera  

* Dodać do aplikacji obiekt reprezentacyjny stan globalny 

  * Stan na razie zawiera tylko pole `issues` na listę zgłoszeń z wartością inicjalna - pusta lista 

* Po zalogowaniu trenera wyświetlić ekran listy zgłoszeń  

  P* rzekazać do ekranu dane ze stanu globalnego  

* Dodać obsługę akcji `ISSUES` 

  * Zaktualizować listę zgłoszeń w stanie globalnym  


## 6. Odpowiedź na zgłoszenie  

### Klient: 

* Dodać do listy zgłoszeń czwartą kolumnę wyświetlającą nazwę trenera, który przyjął zgłoszenie  

  * W odpowiedzi zostanie dodane pole `trainerName` 

  * Dodać do listy zgłoszeń piątą kolumnę z przyciskiem `Przyjęte` 

* Po kliknięciu wysłać event z akcją `ISSUE_TAKEN` z `payload` o wartości `issueId` 

### Serwer: 

* Dodać obsługę akcji `ISSUE_TAKEN` 

  * Znaleźć w kolekcji zgłoszenie wykorzystując `payload` zawierający identyfikator zgłoszenia  

  * Zmienić status zgłoszenia na `TAKEN` 

  * Wysłać akcje `ISSUE_LIST` do wszystkich trenerów 

## 7. Trener w drodze 

### Serwer: 

* Dodać do obsługi akcji `ISSUE_TAKEN` wysyłanie akcji `TRAINER_ON_WAY` z `payload` z wartością nazwy trenera, który odebrał zgłoszenie do uczestnika, który zgłosił problem  

### Klient: 

* Dodać do stanu globalnego pole `myIssue` reprezentujące zgłoszenie w postaci: 

  * `status` - status zgłoszenia  
  
  * `trainerName` - nazwa trenera, który przyjął zgłoszenie 

  * Inicjalnie pole ma wartość `null` 

* Dodać ekran zgłoszenia uczestnika 

  * Po utworzeniu zgloszenia ekran prezentuje tekst `Oczekiwanie na przyjęcie zgłoszenia` - `status` zgłoszenia ma wartość `RECEIVED` 

  * Dla statusu `TRAINER_ON_WAY` wyświetlić tekst `Traner Xxx jest w drodze do Ciebie` 

* Po wysłaniu zgłoszenia: 

  * Ustawić dane w stanie globalnym 

  * Zmienić na ekran zgłoszenia uczestnika  


## 8. Problem rozwiązany  

### Klient: 

* Dodać do stanu globalnego pole `issueId` inicjalnie równe `null` 

* Dodać obsługę akcji `ISSUE_RECEIVED` 

  * Zawartość `payload` ustawić jako wartość pola `issueId` 

* Dodać na ekranie zgłoszenia przycisk `Problem rozwiązany`  

  * Po kliknięciu wysłać event z akcją `ISSUE_SOLVED` z `payload` z wartością `issueId`  

  * Zmienić na ekran zgłaszania problemu  

### Serwer: 

* Po przyjęciu zgłoszenia odesłać akcje `ISSUE_RECEIVED` z `payload` z wartością identyfikatora utworzonego zgłoszenia 

  * Dodać obsługę akcji `ISSUE_SOLVED` 
  
  * Wykorzystać identyfikator  z `payload` do odnalezienia zgłoszenia i aktualizacji statusu zgłoszenia na `SOLVED` 


## 9. Pomoc przez wiadomość  

### Klient: 

* Dodać do stanu globalnego pole `hint` o wartości inicjalnej `null` 

* Dodać obsługę akcji `HINT`  

  * Ustawić wartość `payload` wartości pola `hint` w stanie globalnym  

* Na ekranie zgłoszenia jeśli `hint` nie jest puste wyświetlić: 

  * Wiadomość od trenera  
  
  * Przyciski: 
  
    * `Pomogło` 
      
      * Po kliknięciu wysyłać akcje `ISSUE_SOLVED` 
      
      * Wyświetlić ekran zgłaszania problemu 
      
      * Ustawić wartość pola `hint` na `null` 
      
    * `Nie pomogło` 
    
      * Po kliknięciu wysłać akcję `HINT_FAIL` z `payload` z wartością `issueId` 
      
      * Ustawić wartość pola `hint` na `null` 

* Rozszerzyć strukturę reprezentującą zgłoszeniu na liście o pole `hint` 

* Na ekranie listy zgłoszeń dodać szósta kolumnę z `textarea` na opis rozwiązania problemu oraz przycisk `wyślij` 

  * Po kliknięciu wysłać event z akcją `HINT` z `payload` z wartością `textarea` 

Serwer: 

* Dodać obsługę akcji `HINT` 

* Dodać obsługę akcji `HINT_FAIL` 

 

 

 

 

 

 
