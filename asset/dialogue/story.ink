-> top_knot

=== convo_1 ===
= opener
Lately... #speaker=fyodor
I feel like I've been really out of it.
Maybe I need to exercise more?
+ [No you're perfect]
    -> do_like
+ [Maybe a bit more?]
    -> dont_like

= do_like
    Yeah you're right #animation=fyodor,jump
    -> DONE

= dont_like
    Gyaahhhh I hate exercise though!!!   #animation=fyodor,pontificate
    -> DONE
-> DONE

=== convo_2 ===
What is my biggest worry?
Probably being trapped...
...inside my house...
...forever...
...without any TV to stream
-> DONE

=== convo_3 ===
Not goona lie... #speaker=athena
lately my aesthetic has been...
finding the lizard people.
-> DONE

=== convo_4 ===
Not goona lie... #speaker=josephine
I think Psycho Soldier's a bad game
HEY!  #speaker=athena #animation=athena,nod
I heard that!
Yikes! #speaker=josephine
I better lay low for a while.
Until I can voice my SNK free speech.
-> DONE

=== top_knot ===
Jella: Hello world!
Michael: What now? 
* [uhhh] -> convo_1
* [hmm] -> top_knot
+ [...] -> DONE
