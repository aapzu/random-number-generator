# random-number-generator
Generate random images through an api

[API docs](https://random-number-generator-aapzu.vercel.app)

## Features
The example images update when you refresh the browser

- Generate random number between two numbers
  - <img title="Example between 0 and 1000" src="https://random-number-generator-aapzu.vercel.app/number?min=0&max=1000&height=80&width=100" />
- Return random item from a list
  - <img title="Example returning a random alphabet character" src="https://random-number-generator-aapzu.vercel.app/listItem?height=80&width=100&&items=a&items=b&items=c&items=d&items=e&items=f&items=g&items=h&items=i&items=j&items=k&items=l&items=m&items=n&items=o&items=p&items=q&items=r&items=s&items=t&items=u&items=v&items=w&items=x&items=y&items=z" />
- Return a random order of a given list
  - <img title="Random order of list [a, b, c]" src="https://random-number-generator-aapzu.vercel.app/listOrder?height=80&width=100&items=a&items=b&items=c" />

All the endpoints can return the response either as JSON or as an image.
