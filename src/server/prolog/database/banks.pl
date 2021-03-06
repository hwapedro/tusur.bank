:- dynamic(history/9).

bank(sberbank,'СБЕР БАНК','ПАО «Сбербанк» — российский финансовый конгломерат, крупнейший транснациональный банк России, Центральной и Восточной Европы.', '#21a038').
bank(vtb,'ВТБ','Банк ВТБ — российский универсальный коммерческий банк c государст- венным участием. Банк ВТБ является головной структурой Группы ВТБ.', '#092972').

credit(sberbank, 5.5, 20, 6, 1).
credit(sberbank, 2.5, 10, 3, 2).
credit(sberbank, 1.5, 20, 2, 3).

credit(vtb, 4.5, 20, 5, 4).
credit(vtb, 2.5, 20, 10, 5).
credit(vtb, 1.1, 20, 1, 6).
credit(vtb, 3, 100, 10, 7).

list_min([L|Ls], Min) :-
    list_min(Ls, L, Min).

list_min([], Min, Min).
list_min([L|Ls], Min0, Min) :-
    Min1 is min(L, Min0),
    list_min(Ls, Min1, Min).

getmincredit(BANK, MIN):-findall(RATE, credit(BANK, RATE, _, _, _), LIST), list_min(LIST, MIN).

and(A,B):- A, B.
or(A,B):- A ; B.
is_true(true).  
 
createList([],_,_,[]). 
createList([[M,Y,ID]|TAIL],MILLION,YEAR,[ID|IDTAIL]):- 
    and(Y>=YEAR,M>=MILLION),	
	createList(TAIL, MILLION, YEAR, IDTAIL). 

createList([[M,Y,_]|TAIL],MILLION,YEAR,RESULT):- 
    or(Y<YEAR, M<MILLION), 
    createList(TAIL, MILLION, YEAR, RESULT).


round(X,Y,D) :- DEG is 10^D, Z is X * DEG, Y is round(Z) / DEG.

getmonthamount(AMOUNT,RATE,MONTHS,X,Y):- 
    round((RATE/1200), R, 5),
    TEMP is (R+1)^MONTHS,
    X is round(AMOUNT*((R*TEMP)/(TEMP-1))),
    Y is X*MONTHS.

getAllmonthamount([], [], [], _, _).
getAllmonthamount([ID|FTAIL], [RESULT|STAIL], [AMOUNTS|AMOUNTSTAIL], AMOUNT, MONTHS):-
    credit(_,RATE,_,_,ID),
    getmonthamount(AMOUNT, RATE, MONTHS, RESULT, AMOUNTS),
    getAllmonthamount(FTAIL, STAIL, AMOUNTSTAIL, AMOUNT,  MONTHS).

customAppent([], [], [], []).
customAppent([LIST1|TAIL1], [LIST2|TAIL2], [LIST3|TAIL3], [[LIST1, LIST2, LIST3]|TAIL4]):-
    customAppent(TAIL1, TAIL2, TAIL3, TAIL4).

bubblesort([], []).          
bubblesort([H], [H]).       
bubblesort([[H1,H2,H3]|T], S) :-      
    bubblesort(T, [[M1,M2,M3]|R]),    
    (                                 
       H2 =< M2,                        
             S = [[H1,H2,H3],[M1,M2,M3]|R]              
    ;                                 
       H2 > M2,                         
             bubblesort([[M1,M2,M3],[H1,H2,H3]|R], S)  
    ).


getOrderAmountList(BANKID,AMOUNT,MONTHS,RESULT):- 
    MILLION is AMOUNT/1000000,
    YEAR is MONTHS/12,
    findall([CYEAR,CAMOUNT,ID], credit(BANKID, _,CAMOUNT,CYEAR,ID), CREDITLIST),
    createList(CREDITLIST, MILLION, YEAR, IDLIST),
    getAllmonthamount(IDLIST, MONTHAMOUNTRESULT, AMOUNTRESULT, AMOUNT, MONTHS),
    customAppent(IDLIST, MONTHAMOUNTRESULT, AMOUNTRESULT, LIST),
    bubblesort(LIST, RESULT).

list_length([], '0').
list_length(Xs,L) :- list_length(Xs,0,L).
list_length([],L,L ) .
list_length( [_|Xs] , T , L ) :-
  T1 is T+1 ,
  list_length(Xs,T1,L).

getHistoryLenght(U, L):-
    findall(INDEX, history(U,_,_,_,_,_,INDEX,0,_), LIST),
    list_length(LIST, L).

creditTake(Q,W,E,R,T,Y):-
    findall(INDEX, history(_,_,_,_,_,_,INDEX,_,_), LIST),
    list_length([1|LIST], L),
    CREDITINDEX is L + 1,
    assertz(history(Q,W,E,R,T,Y,CREDITINDEX,0,0)), 
    open('./prolog/database/history.pl',write,Out),
    listing(history/9, Out),
    close(Out).  
    
closeCredit(INDEX):-
    history(Q,W,AMOUNT,E,R,T,INDEX,_,USERAMOUNT),
    FULLAMOUNT is AMOUNT + USERAMOUNT,
    retract(history(_,_,_,_,_,_,INDEX,_,_)), 
    assertz(history(Q,W,0,E,R,T,INDEX,1,FULLAMOUNT)), 
    open('./prolog/database/history.pl',write,Out),
    listing(history/9, Out),
    close(Out).  

repaymentCredit(INDEX,RAMOUNT,NEWAMOUNT,NEWMONTHSAMOUNT):-
    history(Q,CREDITID,AMOUNT,E,MONTHS,T,INDEX,_,_),
    NEWAMOUNT is AMOUNT - RAMOUNT,
    NEWAMOUNT \== 0,
    NEWMONTHSAMOUNT is round(NEWAMOUNT/MONTHS),
    retract(history(_,_,_,_,_,_,INDEX,_,_)), 
    assertz(history(Q,CREDITID,NEWAMOUNT,NEWMONTHSAMOUNT,MONTHS,T,INDEX,0,RAMOUNT)), 
    open('./prolog/database/history.pl',write,Out),
    listing(history/9, Out),
    close(Out);
    closeCredit(INDEX).



