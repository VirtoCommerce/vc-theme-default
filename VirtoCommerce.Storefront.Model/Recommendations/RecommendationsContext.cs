﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtoCommerce.Storefront.Model.Recommendations
{
    public class RecommendationsContext
    {
        public string UserId { get; set; }

        public string[] ProductIds { get; set; }
    }
}