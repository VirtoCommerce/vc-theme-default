---
{  }
---
# JSON Page for VirtoCommerce Storefront

VirtoCommerce Storefront allows to build pages without using html. 

## Getting started
You can find the example in 'json-examples/mytest.json'.

1. Create json file in your store's folder.
../Pages/Electronics/mytest.json

2. Append blocks
../Pages/Electronics/mytest.json
[
    {
        "type": "settings",
        "permalink": "mytest",
        "title": "About Us"
    },
    {
        "type": "image",
        "wrapping": true,
        "url": "https://virtocommerce.com/themes/assets/logox2.jpg"
    },
    {
        "type": "text",
        "textAlign": "justify",
        "content": "Virto Commerce was founded in 2011 by industry experts with decades of ecommerce experience. Today, we are Microsoft Gold Partner and provide ecommerce technology, services and expertise for hundreds of merchants and solution companies. Leveraging our open source ecommerce platform, hosted solution and full-service offering, our clients strategically use ecommerce to build stronger customer relationships and rapidly increase global online sales."
    }
]

3. Open your VirtoCommerce web-site and type 
http:// ... /Electronics/mytest

You will see something like that:


## The structire of json-page

The json-file consists of blocks. Each block has two common attribute and may have its own attributes.

**type**
Type is a type of a block, or snippet that will be used to render the block. For example, "text", "image", etc.
All sinppets are stored in a folder "snippets". 
You can define your own types and implement a snippets for them.

**blocks**
Each block may have inner blocks that are stored as an array in this structure.
To display a list of block you may use default type "container" or make your own type and implement an appropriate snippet.


## type of a block "settings"

The block with a type "settings" has general information of a page.

**title**
Title of a page.

**permalink**
The URL-adrress of a page. 


## What's Included

1. Template "cmspage.linquid"
It's used to render json-pages

2. Sinppets (types):

snippets/text - render a text block
snippets/image - render an image block
snippets/container - render a list of blocks 
snippets/unordered-list - render an unordered list

3. Examples
json-examples/about-us.json
json-examples/mytest.json