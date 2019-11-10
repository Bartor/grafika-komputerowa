# Lista 1.

Disclaimer na początek: kod na tej liście nie skupia się na wydajności, a jedynie na przejrzystości, dostępności i łatwości modyfikacji. Porady dotyczące optymalizacji znajdują się na samym dole tego pliku, gdyby ktoś jednak chciał kiedyś się tym zainteresować. W aktualnej wersji silnik 3d jest w stanie ogarnąć na średnim komputerze okolice 12 000 rysowanych linii (tak, średniawo przydatna informacja, bo ani nie definiuję specyfikacji ani metodologii - _dude trust me_).

## Ogólne
Kod używany w rozwiązaniach znajduje się zwykle w dwóch miejscach:
1. Katalogu `shared`
2. Katalogu `zad$n`

Katalog `shared` naturalnie odpowiada za kawałki kodu dzielone pomiędzy zadaniami. Większość plików `.js` napisanych jest w standardzie ES6 Modules i przy ich importowaniu należy użyć atrybutu `type` w tagu script, np.:
```html
<script src="some/path/to/file.js" type="module"></script>
```
Następnie w pliku używającym modułu wystarczy użyć:
```js
import {ExportedMember} from 'file.js';
```

## Shared
### ExecutionContext.js
Plik zawiera dwie klasy, jedną eksportuje; klasa `ExecutionContext` dotyczy _jakiegoś_ kontekstu wykonywania poleceń Logomocji. Może to być np. `fw 200 rt 10 fw 200`. Używając bardziej zaawansowanych konstrukcji z `repeat` uzyskujemy realnie dwa konteksty wykonywania, jeden nad drugim; `fw 10 repeat 10 [ fw 20 rt 20 ]` tworzy kontekst wykonywania `fw 10 repeat` i `fw 20 rt 20`. Polecenie `repeat` jest w tym wypadku później rozwijany w 10 powtórzeń jego lokalnego kontekstu. Klasa `AtomicExecution` implementuje interakcję persowanych komend z klasami interfejsu `BetterLogo` (oczywiście interfejsu tam nie ma, bo JS nienawidzi ładnego OOP).

### BetterLogo.js
Klasa odpowiedzialna za rysowanie logomocji na canvasie w 2d, korzysta z ExecutionContext w celu wykonywania wprowadzonych komend, nadrzędna mu. Zajmuje się głównie pamiętaniem pozycji żółwia, translacją jej i poprawnymi zmianami rotacji.

### WireFrame.js
Plik zawiera dwie klasy, bazową `WireFrame` oraz dodatkowoą `Line3d`. Pierwsza z nich zajmuje się rysowaniem otrzymywanych `renderList` na canvasie, trzyma referencję na wszystkie istniejące kształty i ich punkty, które potrafi obracać i przesuwać. Same `renderList` zwracane są przez kształty złożone z wielu `Line3d` - klasa `Line3d` posiada metodę `project`, która generuje projekcję linii z 3d na 2d w określonej perspektywnie. Projekcją ta jest właśnie składnik `renderList` używanej przez klasę `WireFrame`. Silnik ten opiera się na stacjonarnej kamerze o lokalizacji `x = 0, y = 0, z = -perspective`, "ekranie" na który odbywa się projekcja linii o lokalizacji `x = 0, y = 0, z = 0`, a wszystkie przesunięcia i rotacje obiektów dotyczą tylko dodawanych kształtów.

### BetterLogo3d.js
Klasa realizująca komendy logomocji w przestrzeni trójwymiarowej, nie ma tu za bardzo czego tłumaczyć. Nie przesuwa poprawnie żółwia, bo tak.

### hilbertXY.js
Pojedyncza funkcja umożliwiająca iteracyjne generowanie kolejnych punktów w krzywej Hilberta, używana w drugim i trzecim zadaniu.

### Controls.js
Dwie klasy ułatwiające tworzenie kontrolerów opartych na myszy oraz klawiaturze, dosyć proste z samoobjaśniającym się kodem, chyba.

## Zadania

1. Nie ma tu nic ciekawego, plik `.js` odpowiada jedynie za wpisywanie komend do Logomocji.
2. Plik `hilbert.js` generuje polecenie w mojej składni logomocji rysujące krzywą Hilberta danego stopnia. Można je wkleić do zadania pierwszego i zadziała.
3. Plik `.js` generuje krzywą `<polyline>` w SVG opierając się na funkcji z `hilbertXY.js`.
4. Plik `*Page.js` zajmuje się jedynie dodaniem kilku kształtów, usunięciem po czasie i rotacją, aby pokazać możliwości techniczne silnika. Plik `*Game.js` implementuje grę opartą o `WireFrame.js`. Wszystkie pliki korzystają z klasy `Cuboid` opisującą prostopadłościan przy pomocy 12 `Line3d`.
5. Implementuje jedynie wpisywanie komend do `BetterLogo3D` i kontrolki do poruszania kamerą.

## Optymalizacja
Zaprezentowana tu implementacja cierpi głównie ze względu na to, że do przenoszenia danych pomiędzy komponentami wszędzie używane są obiekty oraz ich destrukturyzacja, co pozytywnie wpływa na długość i czytelność kodu, ale nie jest najwydajniejszym rozwiązaniem.

Dobrym pomysłem _może być_ używanie względnie niskopoziomowego [Float64Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array), który umożliwia tworzenie tablic o z góry określonym rozmiarze oraz bezpośredniej, ciąglej reprezentacji w pamięci (trochę jak w C). Używając tak tworzonych obiektów i odwołując do ich konkretnych indeksów w celu czytania chociażby wartości z wektorów czy pozycji, a nawet pójście dalej i przechowywanie wszystkich pozycji w jednym takim obiekcie ma kilka zalet, między innymi pozbycie się destrukturyzacji, umożliwienie świadomego optymalizowania pod względem cache'u procesora na różnych silnikach, a sam interpreter/kompilator nie musi więcej zgadywać typów ani dbać o liczenie potrzebego rozmiaru alokacji nowych obiektów.

Przepisana w ten sposób aplikacja będziue miała absolutnie potworny i nieczytelny kod, ale _może_ działać lepiej - pytanie, czy ktokolwiek chce się przez to przebijać. Ja nie, ale drzwi zostawiam otwarte, kod jest publiczny.

Czy powższa sekcja w ogóle ma sens? Nie wiem, nie znam się, zgaduję sobie. Możesz zawsze zrobić pull requesta i wyśmiać mnie w komentarzu.