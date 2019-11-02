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
    Really?
    Not even a bit?
    I don't really believe that.
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
SNK bring me back plz
-> DONE

=== convo_4 ===
Do you think lizard people...
...are real?
-> DONE

=== top_knot ===
Jella: Hello world!
Michael: What now? 
* [uhhh] -> convo_1
* [hmm] -> top_knot
+ [...] -> DONE
