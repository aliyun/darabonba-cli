// This file is auto-generated, don't edit it. Thanks.

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

using Tea;
using Tea.Utils;


namespace Darabonba.Test
{
    public class Client 
    {

        public static Dictionary<string, string> HelloMap()
        {
            Dictionary<string, string> m = new Dictionary<string, string>(){};
            return TeaConverter.merge<string>
            (
                new Dictionary<string, string>()
                {
                    {"key", "value"},
                    {"key-1", "value-1"},
                },
                m
            );
        }

    }
}
