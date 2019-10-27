-> top_knot

=== convo_1 ===
= opener
Hey, question for you.
Do you like pickles?
+ [Yeah]
    -> do_like
+ [No!]
    -> dont_like

= do_like
    Nice. Me too.
    -> DONE

= dont_like
    Not even a bit?
    Are you sure there isn't something wrong with you?
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
Yeah, I think he left earlier
Hope he got his flight
-> DONE

=== convo_4 ===
He's a fool for trusting airplanes
He'll be replaced by a lizard person!
The lizard people are disguised everywhere
-> DONE

=== top_knot ===
Jella: Hello world!
Michael: What now? 
* [uhhh] -> convo_1
* [hmm] -> top_knot
+ [...] -> DONE
