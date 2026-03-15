# 💅 BekiLang: The Official Guide

Welcome to **BekiLang**, the most glamorous, unapologetic, and fabulous programming language ever created! Built around the vibrant Philippine Gay Lingo (Swardspeak), BekiLang is designed to make coding fierce and fun.

Whether you're declaring a variable or running a loop, you'll be coding with *attitude*.

---

## 1. Data Types (Mga Uri ng Chika)
Every variable needs a personality. BekiLang offers 5 fab data types:

| Keyword | Counterpart (C/Java) | Description | Example |
| :--- | :--- | :--- | :--- |
| **`borta`** | `int` | Whole numbers, big and strong. | `borta age ay 18 periodt` |
| **`mema`** | `float` | Decimal numbers. It's giving "mema-sabi lang". | `mema price ay 99.99 ganern` |
| **`chika`** | `string` | Text, gossip, sentences. Must be enclosed in `""`. | `chika name ay "Regine" periodt` |
| **`charot`** | `char` | A single character, enclosed in `''`. | `charot grade ay 'A' ganern` |
| **`truch`** | `boolean` | True or False values. The tea is either valid or not! | `truch maganda_ako ay korik periodt` |

### Boolean Values:
Instead of `true` or `false`, we use the real truth:
* **`korik`** = `True`
* **`wiz`** = `False`

---

## 2. Variables & Assignment (Pag-angkin)
To create a variable, start with the Data Type, followed by the variable name, the assignment operator **`ay`** (`=`), the value, and end with a delimiter.

* **Assignment Operator:** `ay`
* **Statement Delimiters (Semicolons):** `periodt` OR `ganern`

**Syntax:**
```bekilang
<datatype> <identifier> ay <value> <delimiter>
```

**Examples:**
```bekilang
borta score ay 100 periodt
chika tea ay "Kabet siya!" ganern
truch may_pera ay wiz periodt
```

---

## 3. Operations (Math & Comparisons)

### Arithmetic (Bilangan)
* **`dagdag`** (`+`) : Addition / String Concatenation
* **`bawas`** (`-`) : Subtraction
* **`times`** (`*`) : Multiplication
* **`divide`** (`/`) : Division

```bekilang
borta total ay 10 dagdag 5 periodt // total is 15
```

### Relational (Labanan ng Tarush)
Used to compare two values.
* **`mas_tarush`** (`>`) : Greater Than
* **`mas_chaka`** (`<`) : Less Than
* **`parehas`** (`==`) : Equal To
* **`wit_parehas`** (`!=`) : Not Equal To

### Logical (Dugtungan)
Used for combining `truch` (boolean) expressions.
* **`at_saka`** (`and`) : Logical AND
* **`o_kaya`** (`or`) : Logical OR

---

## 4. Output (I-broadcast ang Chika!)
Want to print something to the console? Use the **`parinig`** keyword!

**Syntax:**
```bekilang
parinig <expression> periodt
```

**Examples:**
```bekilang
parinig "Mang-aagaw!" periodt
parinig "Ang score mo ay: " dagdag score ganern
```
*(Note: `dagdag` concatenates strings just like `+` in Java or JS!)*

---

## 5. Control Structures (Ang Mga Kabanata)

### If-Else Statements (Condition-Conditionan)
Use **`kunwari`** for `if` and **`eh_di`** for `else`. Conditions don't need parentheses, but the code blocks must be inside curly braces `{ }`.

**Syntax:**
```bekilang
kunwari <condition> {
    // code block pag korik
} eh_di {
    // code block pag wiz
}
```

**Example:**
```bekilang
borta edad ay 15 periodt
borta threshold ay 18 periodt

kunwari edad mas_chaka threshold {
    parinig "Bawal pa lumabas ang mga bata!" ganern
} eh_di {
    parinig "Gorabel, party na!" periodt
}
```

### While Loops (Paulit-ulit na Chika)
Use the **`gorabel`** (`while`) keyword to repeat a block of code as long as the condition is `korik`.

**Example:**
```bekilang
borta count ay 1 periodt
gorabel count mas_chaka 4 {
    parinig "Bilang: " dagdag count ganern
    count ay count dagdag 1 periodt
}
```
*(This will print "Bilang: 1", "Bilang: 2", "Bilang: 3")*

---

## 6. Comments (Secret Bulungan)
If you want to leave a note for other programmers (or yourself) without the compiler reading it, use `//`. Everything after `//` on that line is ignored.

```bekilang
// Secret lang natin to ha
borta sweldo ay 500 periodt // Wag mo ipagkalat!
```

---

## Example: A Complete BekiLang Script
```bekilang
// Variable Declarations
chika user ay "Mhiema" periodt
borta tickets ay 2 ganern
truch is_vip ay korik periodt

// Outputs
parinig "Welcome sa concert, " dagdag user ganern

// Logic and Conditions
kunwari is_vip parehas korik at_saka tickets mas_tarush 0 {
    parinig "Pak na pak! VIP ka, pasok!" periodt
    gorabel tickets mas_tarush 0 {
        parinig "🎟️ Ticket scannned! Remaining: " dagdag bawas 1 ganern
        tickets ay tickets bawas 1 periodt
    }
} eh_di {
    parinig "Sorry teh, uwi na!" ganern
}
```

*Welcome to the glamorous world of BekiLang! Happy Coding, sis! 💅✨*
