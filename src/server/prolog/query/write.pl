:- use_module(library(os)).
:- use_module(library(lists)).
:- dynamic(bank/1).

bank(sberbank).
bank(vtb).

filesave(NAME):-
    write('start'),
    assertz(bank(NAME)), 
    open('./prolog/database/output.pl',write,Out),
    listing(bank/1, Out),
    close(Out).  